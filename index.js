const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// LOAD ENV
dotenv.config();

// LOAD UPLOAD MIDDLEWARE
require('./src/middleware/upload');

const app = express();

// ============================================
// TEST ENV
// ============================================
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("DB_NAME:", process.env.DB_NAME);

// ============================================
// MIDDLEWARE
// ============================================
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC FILES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTES
// ============================================
const userRoute = require('./src/routes/userRoute');
const productRoute = require('./src/routes/productRoute');
const brandRoute = require('./src/routes/brandRoute');
const categoryRoute = require('./src/routes/categoryRoute');
const customerRoute = require('./src/routes/customerRoute');
const paymentMethodRoute = require('./src/routes/paymentMethodRoute');
const posSaleRoute = require('./src/routes/posSale');
const analyticsRoute = require('./src/routes/analyticsRoute');
const inventoryRoute = require('./src/routes/inventoryRoute');
const purchaseRoute = require('./src/routes/pruchaseRoute');

// OPTIONAL ROUTES
// const checkoutRoute = require('./src/controller/checkout');
// const khqrRoute = require('./src/routes/khqrRoute');

// REGISTER ROUTES
userRoute(app);
productRoute(app);
brandRoute(app);
categoryRoute(app);
customerRoute(app);
paymentMethodRoute(app);
posSaleRoute(app);
analyticsRoute(app);
inventoryRoute(app);
purchaseRoute(app);

// OPTIONAL ROUTES
// checkoutRoute(app);
// khqrRoute(app);

// ============================================
// DEFAULT API
// ============================================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'POS Backend API Running',
        environment: process.env.NODE_ENV,
    });
});

// ============================================
// SERVER
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});