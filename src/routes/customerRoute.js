const { verify } = require('jsonwebtoken');
const { 
    register, 
    loginCustomer,
    logoutCustomer,
    get, 
    getOne, 
    search, 
    update, 
    changePassword, 
    deleteCustomer, 
    getProfile 
} = require('../controller/customerController');

const {
    placeOrder,
    getOrders,
    getOrderDetail,
    cancelOrder,
    getOrderByEmail,
    getAllOrders
} = require('../controller/customerOrderController');

const CustomerRoute = (app) => {
    // ================== CUSTOMER AUTHENTICATION (Public) ==================
    app.post('/api/customer/register', register);
    // app.post('/api/customer/login', login);
    app.post('/api/customer/login',verify, loginCustomer)
    app.post('/api/customer/logout',verify, logoutCustomer);
    // ================== CUSTOMER MANAGEMENT ==================
    app.get('/api/customer',verify, get);
    app.get('/api/customer/search',verify, search);
    app.get('/api/customer/profile', verify, getProfile);
    app.get('/api/customer/:id', verify, getOne);
    app.put('/api/customer', verify, update);
    app.put('/api/customer/change-password', verify, changePassword);
    app.delete('/api/customer/:id', verify, deleteCustomer); 

    // ================== CUSTOMER ORDERS (Frontend Checkout) ==================
    // Place a new order (checkout) - supports both guest and logged-in customers
    app.post('/api/customer/order', verify, placeOrder);
    
    // Get all orders for logged-in customer
    app.get('/api/customer/orders', verify, getOrders);
    
    // Get orders by email (for guest order tracking)
    app.get('/api/customer/orders/track', verify, getOrderByEmail);
    
    // Get specific order detail
    app.get('/api/customer/order/:order_id', verify, getOrderDetail);
    
    // Cancel an order (logged-in customer only)
    app.delete('/api/customer/order/:order_id', verify, cancelOrder);

    // Admin / report: get all orders
    app.get('/api/orders', verify, getAllOrders);
};

module.exports = CustomerRoute;
