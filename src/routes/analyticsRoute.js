const analyticsController = require('../controller/analyticsController');

const analyticsRoute = (app) => {
  app.get('/api/analytics/sales-summary', analyticsController.getSalesSummary);
  app.get('/api/analytics/sales-trend', analyticsController.getSalesTrend);
  app.get('/api/analytics/top-products', analyticsController.getTopProducts);
  app.get('/api/analytics/top-customers', analyticsController.getTopCustomers);
  app.get('/api/analytics/payment-methods', analyticsController.getPaymentMethodStats);
};

module.exports = analyticsRoute;
