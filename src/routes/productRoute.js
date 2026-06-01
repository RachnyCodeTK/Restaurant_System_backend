const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const {
    get,
    search,
    create,
    getById,
    update,
    deleteProduct,
    adjustment
} = require('../controller/productController'); 

const product = (app) => {
    app.get('/api/product', get);
    app.get('/api/product/search', search);
    app.get('/api/product/:id', getById);
    app.post('/api/product', upload.single('photo'), create);
    app.put('/api/product', upload.single('photo'), update);
    app.delete('/api/product/:prd_id', deleteProduct);
    app.post('/api/product/adjustment', adjustment);
};

module.exports = product;