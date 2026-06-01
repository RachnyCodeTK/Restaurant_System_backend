const { get, search, create, update, deleteBrand } = require('../controller/brandController');
const upload = require('../middleware/upload');

const Brand = (app) => {
    app.get('/api/brand', get);
    app.get('/api/brand/search', search);
    app.post('/api/brand', upload.single('logo'), create);
    app.put('/api/brand/:code', upload.single('logo'), update);
    app.delete('/api/brand/:code', deleteBrand);
};

module.exports = Brand;
