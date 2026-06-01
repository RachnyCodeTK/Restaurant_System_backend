const { get, search, create, update, deleteCategory } = require('../controller/categoryController');
const upload = require('../middleware/upload');

const Category = (app) => {
    app.get('/api/category', get);
    app.get('/api/category/search', search);
    app.post('/api/category', upload.single('image'), create);
    app.put('/api/category/:code', upload.single('image'), update);
    app.delete('/api/category/:code', deleteCategory);
};

module.exports = Category;
