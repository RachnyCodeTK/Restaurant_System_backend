const express = require('express');
const cors = require('cors');
const path = require('path');

// ✅ Load upload middleware early to ensure uploads directory is created
require('./src/middleware/upload');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ROUTES
const userRoute = require('./src/routes/userRoute');
const productRoute = require('./src/routes/productRoute');
const brandRoute = require('./src/routes/brandRoute');
const categoryRoute = require('./src/routes/categoryRoute');
const customerRoute = require('./src/routes/customerRoute');
const paymentMethodRoute = require('./src/routes/paymentMethodRoute');
const posSaleRoute = require('./src/routes/posSale');
const analyticsRoute = require('./src/routes/analyticsRoute');
const inventoryRoute = require('./src/routes/inventoryRoute');
const checkout = require('./src/controller/checkout')
const purchaseRoute = require('./src/routes/pruchaseRoute');

const khqrRoute = require('./src/routes/khqrRoute');



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
// checkout(app);
// khqrRoute(app);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});