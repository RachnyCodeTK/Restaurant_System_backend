const db = require('../config/db');

const inventoryController = {
  // Get All Stock Levels
  getStockLevels: async (req, res) => {
    try {
      const [stocks] = await db.query(
        `SELECT 
          p.prd_id,
          p.prd_code,
          p.name,
          p.price,
          p.qty as current_stock,
          p.photo,
          c.cat_name as category,
          b.brand_name as brand,
          CASE 
            WHEN p.qty < 5 THEN 'Critical'
            WHEN p.qty < 10 THEN 'Low'
            WHEN p.qty < 20 THEN 'Medium'
            ELSE 'Healthy'
          END as stock_status
        FROM products p
        LEFT JOIN categories c ON p.cat_id = c.cat_id
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        WHERE p.status = 1
        ORDER BY p.qty ASC`
      );

      res.json({
        success: true,
        data: stocks.map(s => ({
          product_id: s.prd_id,
          code: s.prd_code,
          name: s.name,
          price: parseFloat(s.price),
          stock: s.current_stock,
          photo: s.photo,
          category: s.cat_name,
          brand: s.brand_name,
          status: s.stock_status
        }))
      });
    } catch (error) {
      console.error('Error fetching stock levels:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get Low Stock Alerts
  getLowStockAlerts: async (req, res) => {
    try {
      const { threshold = 10 } = req.query;

      const [alerts] = await db.query(
        `SELECT 
          p.prd_id,
          p.prd_code,
          p.name,
          p.qty as current_stock,
          p.price,
          p.photo,
          c.cat_name as category,
          ? - p.qty as units_needed
        FROM products p
        LEFT JOIN categories c ON p.cat_id = c.cat_id
        WHERE p.qty < ? AND p.status = 1
        ORDER BY p.qty ASC`,
        [parseInt(threshold), parseInt(threshold)]
      );

      res.json({
        success: true,
        data: alerts.map(a => ({
          product_id: a.prd_id,
          code: a.prd_code,
          name: a.name,
          current_stock: a.current_stock,
          price: parseFloat(a.price),
          photo: a.photo,
          category: a.cat_name,
          units_needed: a.units_needed || 0,
          severity: a.current_stock < 5 ? 'critical' : 'warning'
        }))
      });
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get Stock Adjustments History
  getStockAdjustments: async (req, res) => {
    try {
      const { product_id, limit = 50 } = req.query;

      let query = `
        SELECT 
          sa.adjustment_id,
          sa.prd_id,
          p.name as product_name,
          p.prd_code,
          sa.adjustment_qty,
          sa.reason,
          sa.notes,
          u.name as adjusted_by_user,
          sa.created_at
        FROM stock_adjustments sa
        LEFT JOIN products p ON sa.prd_id = p.prd_id
        LEFT JOIN users u ON sa.adjusted_by = u.id
      `;

      const params = [];
      if (product_id) {
        query += ` WHERE sa.prd_id = ?`;
        params.push(parseInt(product_id));
      }

      query += ` ORDER BY sa.created_at DESC LIMIT ?`;
      params.push(parseInt(limit));

      const [adjustments] = await db.query(query, params);

      res.json({
        success: true,
        data: adjustments.map(a => ({
          adjustment_id: a.adjustment_id,
          product_id: a.prd_id,
          product_code: a.prd_code,
          product_name: a.product_name,
          quantity_change: a.adjustment_qty,
          reason: a.reason || 'Not specified',
          notes: a.notes,
          adjusted_by: a.adjusted_by_user || 'System',
          date: a.created_at
        }))
      });
    } catch (error) {
      console.error('Error fetching stock adjustments:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get Inventory Summary
  getInventorySummary: async (req, res) => {
    try {
      const [summary] = await db.query(
        `SELECT 
          COUNT(DISTINCT prd_id) as total_products,
          SUM(qty) as total_stock_value,
          COUNT(CASE WHEN qty < 5 THEN 1 END) as critical_items,
          COUNT(CASE WHEN qty BETWEEN 5 AND 10 THEN 1 END) as low_stock_items,
          COUNT(CASE WHEN qty > 10 THEN 1 END) as healthy_items
        FROM products 
        WHERE status = 1`
      );

      const [stockValue] = await db.query(
        `SELECT 
          SUM(qty * price) as total_inventory_value
        FROM products 
        WHERE status = 1`
      );

      res.json({
        success: true,
        data: {
          total_products: summary[0].total_products || 0,
          total_units: summary[0].total_stock_value || 0,
          critical_items: summary[0].critical_items || 0,
          low_stock_items: summary[0].low_stock_items || 0,
          healthy_items: summary[0].healthy_items || 0,
          total_value: parseFloat(stockValue[0].total_inventory_value) || 0
        }
      });
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get Stock by Category
  getStockByCategory: async (req, res) => {
    try {
      const [data] = await db.query(
        `SELECT 
          c.cat_name as category,
          COUNT(p.prd_id) as product_count,
          SUM(p.qty) as total_stock,
          SUM(p.qty * p.price) as category_value,
          AVG(p.qty) as avg_stock
        FROM products p
        LEFT JOIN categories c ON p.cat_id = c.cat_id
        WHERE p.status = 1
        GROUP BY c.cat_name
        ORDER BY category_value DESC`
      );

      res.json({
        success: true,
        data: data.map(d => ({
          category: d.category || 'Uncategorized',
          products: d.product_count || 0,
          total_stock: d.total_stock || 0,
          value: parseFloat(d.category_value) || 0,
          avg_stock: parseFloat(d.avg_stock) || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching stock by category:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = inventoryController;
