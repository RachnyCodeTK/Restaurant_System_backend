const db = require('../config/db');
const { errorResponse } = require('../utils/errorHandler');

// ================= GET ALL PAYMENT METHODS =================
const getAll = async (req, res) => {
    try {
        const [methods] = await db.query('SELECT * FROM payment_methods ORDER BY method_name');
        return res.json({ success: true, data: methods, count: methods.length });
    } catch (err) {
        console.error('Get payment methods error:', err);
        return res.status(500).json(errorResponse('Failed to fetch payment methods', 500));
    }
};

// ================= GET PAYMENT METHOD BY CODE =================
const getByCode = async (req, res) => {
    try {
        const code = req.params.code;
        if (!code) {
            return res.status(400).json(errorResponse('Payment method code is required', 400));
        }

        const [rows] = await db.query('SELECT * FROM payment_methods WHERE method_code = ?', [code]);
        if (rows.length === 0) {
            return res.status(404).json(errorResponse('Payment method not found', 404));
        }

        return res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error('Get payment method by code error:', err);
        return res.status(500).json(errorResponse('Failed to fetch payment method', 500));
    }
};

// ================= CREATE PAYMENT METHOD =================
const create = async (req, res) => {
    try {
        const { method_code, method_name, description, status } = req.body;

        if (!method_code || !method_name) {
            return res.status(400).json(errorResponse('method_code and method_name are required', 400));
        }

        const [existing] = await db.query('SELECT * FROM payment_methods WHERE method_code = ?', [method_code]);
        if (existing.length > 0) {
            return res.status(409).json(errorResponse('Payment method code already exists', 409));
        }

        await db.query(
            'INSERT INTO payment_methods (method_code, method_name, description, status) VALUES (?, ?, ?, ?)',
            [method_code, method_name, description || '', status === 0 ? 0 : 1]
        );

        return res.status(201).json({ success: true, message: 'Payment method created successfully' });
    } catch (err) {
        console.error('Create payment method error:', err);
        return res.status(500).json(errorResponse('Failed to create payment method', 500));
    }
};

// ================= UPDATE PAYMENT METHOD =================
const update = async (req, res) => {
    try {
        const code = req.params.code;
        const { method_name, description, status } = req.body;

        if (!code) {
            return res.status(400).json(errorResponse('Payment method code is required', 400));
        }

        const [existing] = await db.query('SELECT * FROM payment_methods WHERE method_code = ?', [code]);
        if (existing.length === 0) {
            return res.status(404).json(errorResponse('Payment method not found', 404));
        }

        await db.query(
            'UPDATE payment_methods SET method_name = ?, description = ?, status = ? WHERE method_code = ?',
            [method_name || existing[0].method_name, description ?? existing[0].description, typeof status !== 'undefined' ? status : existing[0].status, code]
        );

        return res.json({ success: true, message: 'Payment method updated successfully' });
    } catch (err) {
        console.error('Update payment method error:', err);
        return res.status(500).json(errorResponse('Failed to update payment method', 500));
    }
};

// ================= DELETE PAYMENT METHOD =================
const deleteMethod = async (req, res) => {
    try {
        const code = req.params.code;
        if (!code) {
            return res.status(400).json(errorResponse('Payment method code is required', 400));
        }

        const [existing] = await db.query('SELECT * FROM payment_methods WHERE method_code = ?', [code]);
        if (existing.length === 0) {
            return res.status(404).json(errorResponse('Payment method not found', 404));
        }

        // Soft delete (disable) or hard delete
        await db.query('UPDATE payment_methods SET status = 0 WHERE method_code = ?', [code]);

        return res.json({ success: true, message: 'Payment method disabled successfully' });
    } catch (err) {
        console.error('Delete payment method error:', err);
        return res.status(500).json(errorResponse('Failed to delete payment method', 500));
    }
};

module.exports = {
    getAll,
    getByCode,
    create,
    update,
    delete: deleteMethod
};
