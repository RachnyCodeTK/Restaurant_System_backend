const db = require('../config/db');

const analyticsController = {
  // Get Sales Summary (Total Revenue, Orders, Avg Revenue)
  getSalesSummary: async (req, res) => {
    try {
      const [orders] = await db.query(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as avg_revenue,
          SUM(discount_amount) as total_discount
        FROM orders 
        WHERE order_status = 'completed' AND payment_status = 'completed'`
      );

      const [todayStats] = await db.query(
        `SELECT 
          COUNT(*) as today_orders,
          SUM(total_amount) as today_revenue
        FROM orders 
        WHERE order_status = 'completed' 
        AND payment_status = 'completed'
        AND DATE(created_at) = CURDATE()`
      );

      res.json({
        success: true,
        data: {
          total_orders: orders[0].total_orders || 0,
          total_revenue: parseFloat(orders[0].total_revenue) || 0,
          avg_revenue: parseFloat(orders[0].avg_revenue) || 0,
          total_discount: parseFloat(orders[0].total_discount) || 0,
          today_orders: todayStats[0].today_orders || 0,
          today_revenue: parseFloat(todayStats[0].today_revenue) || 0
        }
      });
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get Sales Trend (Daily/Weekly/Monthly)
  getSalesTrend: async (req, res) => {
    try {
      const { period = 'daily' } = req.query; // daily, weekly, monthly

      let dateFormat = '%Y-%m-%d'; // daily
      if (period === 'weekly') dateFormat = '%Y-W%u';
      if (period === 'monthly') dateFormat = '%Y-%m';

      const [trends] = await db.query(
        `SELECT 
          DATE_FORMAT(created_at, ?) as period,
          COUNT(*) as order_count,
          SUM(total_amount) as revenue,
          AVG(total_amount) as avg_order_value
        FROM orders 
        WHERE order_status = 'completed' AND payment_status = 'completed'
        GROUP BY DATE_FORMAT(created_at, ?)
        ORDER BY period DESC
        LIMIT 30`,
        [dateFormat, dateFormat]
      );

      res.json({
        success: true,
        data: trends.map(t => ({
          period: t.period,
          orders: t.order_count || 0,
          revenue: parseFloat(t.revenue) || 0,
          avg_value: parseFloat(t.avg_order_value) || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching sales trend:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get Top Products by Sales
  getTopProducts: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const [topProducts] = await db.query(
        `SELECT 
          p.prd_id,
          p.name,
          p.price,
          p.photo,
          COUNT(oi.order_item_id) as times_sold,
          SUM(oi.item_qty) as total_qty_sold,
          SUM(oi.item_total) as total_revenue
        FROM products p
        LEFT JOIN order_items oi ON p.prd_id = oi.prd_id
        LEFT JOIN orders o ON oi.order_id = o.order_id
        WHERE o.order_status = 'completed' OR oi.order_item_id IS NULL
        GROUP BY p.prd_id, p.name, p.price, p.photo
        ORDER BY total_qty_sold DESC, times_sold DESC
        LIMIT ?`,
        [parseInt(limit)]
      );

      res.json({
        success: true,
        data: topProducts.map(p => ({
          product_id: p.prd_id,
          name: p.name,
          price: parseFloat(p.price),
          photo: p.photo,
          times_sold: p.times_sold || 0,
          qty_sold: p.total_qty_sold || 0,
          revenue: parseFloat(p.total_revenue) || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching top products:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get Top Customers
  getTopCustomers: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const [topCustomers] = await db.query(
        `SELECT 
          c.cust_id,
          c.cust_name,
          c.cust_email,
          c.cust_phone,
          COUNT(o.order_id) as total_orders,
          SUM(o.total_amount) as total_spent,
          AVG(o.total_amount) as avg_spent
        FROM customers c
        LEFT JOIN orders o ON c.cust_id = o.cust_id
        WHERE o.order_status = 'completed' OR o.order_id IS NULL
        GROUP BY c.cust_id, c.cust_name, c.cust_email, c.cust_phone
        ORDER BY total_spent DESC
        LIMIT ?`,
        [parseInt(limit)]
      );

      res.json({
        success: true,
        data: topCustomers.map(c => ({
          customer_id: c.cust_id,
          name: c.cust_name || 'Guest',
          email: c.cust_email,
          phone: c.cust_phone,
          total_orders: c.total_orders || 0,
          total_spent: parseFloat(c.total_spent) || 0,
          avg_spent: parseFloat(c.avg_spent) || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching top customers:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get Payment Method Analytics
  getPaymentMethodStats: async (req, res) => {
    try {
      const [stats] = await db.query(
        `SELECT 
          pm.method_name,
          COUNT(o.order_id) as transaction_count,
          SUM(o.total_amount) as total_amount,
          AVG(o.total_amount) as avg_amount
        FROM payment_methods pm
        LEFT JOIN orders o ON pm.method_code = o.payment_method_code
        WHERE o.order_status = 'completed' OR o.order_id IS NULL
        GROUP BY pm.method_name
        ORDER BY total_amount DESC`
      );

      res.json({
        success: true,
        data: stats.map(s => ({
          method: s.method_name,
          transactions: s.transaction_count || 0,
          total: parseFloat(s.total_amount) || 0,
          avg: parseFloat(s.avg_amount) || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = analyticsController;
