const inventoryController = require('../controller/inventoryController');

const inventoryRoute = (app) => {
  app.get('/api/inventory/stock-levels', inventoryController.getStockLevels);
  app.get('/api/inventory/low-stock-alerts', inventoryController.getLowStockAlerts);
  app.get('/api/inventory/stock-adjustments', inventoryController.getStockAdjustments);
  app.get('/api/inventory/summary', inventoryController.getInventorySummary);
  app.get('/api/inventory/by-category', inventoryController.getStockByCategory);
};

module.exports = inventoryRoute;
