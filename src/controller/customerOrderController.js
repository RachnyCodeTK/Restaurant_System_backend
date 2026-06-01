const db = require('../config/db');
const { errorResponse } = require('../utils/errorHandler');

// ================= PLACE ORDER (CHECKOUT) =================
const placeOrder = async (req, res) => {
    try {
        const { cust_id, cust_email, delivery_address, items, total_amount, payment_method_code } = req.body;

        // Validation
        if ((!cust_id && !cust_email) || !delivery_address || !items || items.length === 0 || !payment_method_code) {
            return res.status(400).json(
                errorResponse('Customer ID or email, delivery address, items, and payment method code are required', 400)
            );
        }

        if (!total_amount || total_amount <= 0) {
            return res.status(400).json(
                errorResponse('Invalid total amount', 400)
            );
        }

        const normalizedPaymentMethodCode = (payment_method_code || '').toString().trim();

        // Check if payment method exists (case-insensitive match)
        const [paymentCheck] = await db.query(
            'SELECT method_code FROM payment_methods WHERE LOWER(method_code) = LOWER(?) AND status = 1',
            [normalizedPaymentMethodCode]
        );

        if (paymentCheck.length === 0) {
            return res.status(400).json(
                errorResponse('Invalid or inactive payment method', 400)
            );
        }

        let customerId = cust_id || null;

        if (!customerId && cust_email) {
            const [customerRows] = await db.query(
                'SELECT cust_id FROM customers WHERE cust_email = ?',
                [cust_email]
            );

            if (customerRows.length > 0) {
                customerId = customerRows[0].cust_id;
            }
        }

        const invoice_number = req.body.invoice_number || `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        let description = req.body.description;

        if (!description || description.trim() === '') {
            const productIds = items.map(item => item.prd_id).filter(Boolean);

            if (productIds.length > 0) {
                const [productRows] = await db.query(
                    'SELECT prd_id, COALESCE(name, prd_name) AS name FROM products WHERE prd_id IN (?)',
                    [productIds]
                );

                const productMap = productRows.reduce((map, product) => {
                    map[product.prd_id] = product.name;
                    return map;
                }, {});

                description = items
                    .map(item => {
                        const name = productMap[item.prd_id] || item.name || `Item ${item.prd_id || ''}`.trim();
                        return `${name} x${item.item_qty || 1}`;
                    })
                    .join(', ');
            }
        }

        if (!description || description.trim() === '') {
            description = 'POS / checkout sale';
        }

        const discount_amount = Number(req.body.discount_amount) || 0;
        const paid_amount = Number(req.body.paid_amount) || total_amount;
        const change_amount = Number(req.body.change_amount) || 0;
        const currency = req.body.currency || 'USD';

        const orderSql = `
            INSERT INTO orders (
                cust_id,
                cust_email,
                delivery_address,
                total_amount,
                discount_amount,
                paid_amount,
                change_amount,
                currency,
                payment_method_code,
                payment_status,
                order_status,
                invoice_number,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'completed', ?, ?)
        `;

        const [orderResult] = await db.query(orderSql, [
            customerId,
            cust_email,
            delivery_address,
            total_amount,
            discount_amount,
            paid_amount,
            change_amount,
            currency,
            normalizedPaymentMethodCode,
            invoice_number,
            description
        ]);

        const order_id = orderResult.insertId;

        // Insert order items and decrement stock
        for (let item of items) {
            const itemSql = `
                INSERT INTO order_items (order_id, prd_id, item_qty, item_price, item_total)
                VALUES (?, ?, ?, ?, ?)
            `;

            await db.query(itemSql, [
                order_id,
                item.prd_id,
                item.item_qty,
                item.item_price,
                item.item_qty * item.item_price
            ]);

            await db.query(
                `UPDATE products SET qty = qty - ? WHERE prd_id = ?`,
                [item.item_qty, item.prd_id]
            );
        }

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: {
                order_id: order_id,
                cust_id: customerId,
                total_amount: total_amount,
                order_status: 'completed',
                payment_method_code: payment_method_code,
                invoice_number,
                description,
                paid_amount,
                change_amount,
                discount_amount,
                order_date: new Date()
            }
        });

    } catch (err) {
        console.error('Place order error:', err.message);
        console.error('Full error:', err);
        return res.status(500).json(
            errorResponse('Failed to place order: ' + err.message, 500)
        );
    }
};

// ================= GET ALL ORDERS FOR REPORTS =================
// const getAllOrders = async (req, res) => {
//     try {
//         const [rows] = await db.query(
//             `SELECT o.*, GROUP_CONCAT(CONCAT(COALESCE(p.prd_name, p.name), ' x', oi.item_qty) SEPARATOR ', ') AS item_details
//              FROM orders o
//              LEFT JOIN order_items oi ON o.order_id = oi.order_id
//              LEFT JOIN products p ON oi.prd_id = p.prd_id
//              GROUP BY o.order_id
//              ORDER BY o.created_at DESC`
//         );

//         return res.json({
//             success: true,
//             data: rows,
//             count: rows.length
//         });

//     } catch (err) {
//         console.error('Get all orders error:', err);
//         return res.status(500).json(
//             errorResponse('Failed to retrieve order report', 500)
//         );
//     }
// };

const getAllOrders = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                o.*, 
                GROUP_CONCAT(
                    CONCAT(p.name, ' x', oi.item_qty) 
                    SEPARATOR ', '
                ) AS item_details
             FROM orders o
             LEFT JOIN order_items oi 
                ON o.order_id = oi.order_id
             LEFT JOIN products p 
                ON oi.prd_id = p.prd_id
             GROUP BY o.order_id
             ORDER BY o.created_at DESC`
        );

        return res.json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (err) {
        console.error('Get all orders error:', err);

        return res.status(500).json(
            errorResponse('Failed to retrieve order report', 500)
        );
    }
};

// ================= GET ALL ORDERS FOR CUSTOMER =================
const getOrders = async (req, res) => {
    try {
        const cust_id = req.body.cust_id || req.query.cust_id;

        if (!cust_id) {
            return res.status(400).json(
                errorResponse('Customer ID is required', 400)
            );
        }

        const [rows] = await db.query(
            "SELECT * FROM orders WHERE cust_id = ? ORDER BY order_id DESC",
            [cust_id]
        );

        return res.json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (err) {
        console.error('Get orders error:', err);
        return res.status(500).json(
            errorResponse('Failed to retrieve orders', 500)
        );
    }
};

// ================= GET ORDERS BY EMAIL (FOR REGISTERED CUSTOMER TRACKING) =================
const getOrderByEmail = async (req, res) => {
    try {
        const cust_email = req.query.email || req.body.cust_email;

        if (!cust_email) {
            return res.status(400).json(
                errorResponse('Email is required', 400)
            );
        }

        const [customerRows] = await db.query(
            'SELECT cust_id FROM customers WHERE cust_email = ?',
            [cust_email]
        );

        if (customerRows.length === 0) {
            return res.status(404).json(
                errorResponse('Customer not found', 404)
            );
        }

        const customerId = customerRows[0].cust_id;
        const [rows] = await db.query(
            'SELECT * FROM orders WHERE cust_id = ? ORDER BY order_id DESC',
            [customerId]
        );

        return res.json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (err) {
        console.error('Get orders by email error:', err);
        return res.status(500).json(
            errorResponse('Failed to retrieve orders', 500)
        );
    }
};

// ================= GET ORDER DETAIL WITH ITEMS =================
const getOrderDetail = async (req, res) => {
    try {
        const order_id = req.params.order_id;

        if (!order_id) {
            return res.status(400).json(
                errorResponse('Order ID is required', 400)
            );
        }

        // Get order details
        const [orderRows] = await db.query(
            "SELECT * FROM orders WHERE order_id = ?",
            [order_id]
        );

        if (orderRows.length === 0) {
            return res.status(404).json(
                errorResponse('Order not found', 404)
            );
        }

        const order = orderRows[0];

        // Get order items
        const [itemRows] = await db.query(
            "SELECT * FROM order_items WHERE order_id = ?",
            [order_id]
        );

        return res.json({
            success: true,
            data: {
                order: order,
                items: itemRows,
                itemCount: itemRows.length
            }
        });

    } catch (err) {
        console.error('Get order detail error:', err);
        return res.status(500).json(
            errorResponse('Failed to retrieve order detail', 500)
        );
    }
};

// ================= CANCEL ORDER =================
const cancelOrder = async (req, res) => {
    try {
        const order_id = req.params.order_id;

        if (!order_id) {
            return res.status(400).json(
                errorResponse('Order ID is required', 400)
            );
        }

        // Check if order exists
        const [rows] = await db.query(
            "SELECT * FROM orders WHERE order_id = ?",
            [order_id]
        );

        if (rows.length === 0) {
            return res.status(404).json(
                errorResponse('Order not found', 404)
            );
        }

        const order = rows[0];

        // Check if order can be cancelled (only pending orders)
        if (order.order_status !== 'pending') {
            return res.status(400).json(
                errorResponse(`Cannot cancel order with status: ${order.order_status}`, 400)
            );
        }

        // Update order status
        await db.query(
            "UPDATE orders SET order_status = ? WHERE order_id = ?",
            ['cancelled', order_id]
        );

        return res.json({
            success: true,
            message: "Order cancelled successfully"
        });

    } catch (err) {
        console.error('Cancel order error:', err);
        return res.status(500).json(
            errorResponse('Failed to cancel order', 500)
        );
    }
};

module.exports = {
    placeOrder,
    getOrders,
    getOrderByEmail,
    getOrderDetail,
    cancelOrder,
    getAllOrders
};
