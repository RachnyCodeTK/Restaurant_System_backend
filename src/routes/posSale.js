const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');


const {
    get,
    search,
    create,
    update,
    deleteProduct
} = require('../controller/productController');

const product = (app) => {
    app.get('/api/product', get);
    app.get('/api/product/search', search);
    app.post('/api/product', upload.single('photo'), create);
    app.put('/api/product', upload.single('photo'), update);
    app.delete('/api/product/:prd_id', deleteProduct);
};

module.exports = product;