const {
    get,
    create,
    update,
    deletePurchase
} = require('../controller/purchaseController');

const purchase = (app) => {

    app.get('/api/purchase', get);

    app.post('/api/purchase', create);

    app.put('/api/purchase', update);

    app.delete('/api/purchase/:pur_id', deletePurchase);
};

module.exports = purchase;