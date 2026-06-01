const db = require('../config/db');


// ============================
// GET ALL PURCHASES
// ============================
const get = async (req, res) => {

    try {

        // get purchases
        const [purchases] = await db.query(`
            SELECT *
            FROM purchases
            ORDER BY pur_id DESC
        `);

        // get items for each purchase
        for (const purchase of purchases) {

            const [items] = await db.query(`
                SELECT
                    product_name,
                    qty,
                    price,
                    total
                FROM purchase_items
                WHERE pur_id = ?
            `, [purchase.pur_id]);

            purchase.products = items;
        }

        res.status(200).json(purchases);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};



// ============================
// CREATE PURCHASE
// ============================
const create = async (req, res) => {

    try {

        const {
            po_number,
            supplier,
            purchase_date,
            items
        } = req.body;

        // calculate total
        let total_amount = 0;

        items.forEach(item => {
            total_amount += item.qty * item.price;
        });

        // insert purchase
        const [purchaseResult] = await db.query(`
            INSERT INTO purchases
            (
                po_number,
                supplier,
                purchase_date,
                total_amount
            )
            VALUES (?, ?, ?, ?)
        `, [
            po_number,
            supplier,
            purchase_date,
            total_amount
        ]);

        const pur_id = purchaseResult.insertId;

        // insert purchase items
        for (const item of items) {

            const total = item.qty * item.price;

            await db.query(`
                INSERT INTO purchase_items
                (
                    pur_id,
                    product_name,
                    qty,
                    price,
                    total
                )
                VALUES (?, ?, ?, ?, ?)
            `, [
                pur_id,
                item.product,
                item.qty,
                item.price,
                total
            ]);
        }

        res.status(201).json({
            message: 'Purchase Created Successfully'
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};


// ============================
// UPDATE PURCHASE
// ============================
const update = async (req, res) => {

    try {

        const {
            pur_id,
            po_number,
            supplier,
            purchase_date,
            items
        } = req.body;

        let total_amount = 0;

        items.forEach(item => {
            total_amount += item.qty * item.price;
        });

        // update purchase table
        await db.query(`
            UPDATE purchases
            SET
                po_number = ?,
                supplier = ?,
                purchase_date = ?,
                total_amount = ?
            WHERE pur_id = ?
        `, [
            po_number,
            supplier,
            purchase_date,
            total_amount,
            pur_id
        ]);

        // delete old items
        await db.query(`
            DELETE FROM purchase_items
            WHERE pur_id = ?
        `, [pur_id]);

        // insert new items
        for (const item of items) {

            const total = item.qty * item.price;

            await db.query(`
                INSERT INTO purchase_items
                (
                    pur_id,
                    product_name,
                    qty,
                    price,
                    total
                )
                VALUES (?, ?, ?, ?, ?)
            `, [
                pur_id,
                item.product,
                item.qty,
                item.price,
                total
            ]);
        }

        res.status(200).json({
            message: 'Purchase Updated Successfully'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};


// ============================
// DELETE PURCHASE
// ============================
const deletePurchase = async (req, res) => {

    try {

        const { pur_id } = req.params;

        await db.query(`
            DELETE FROM purchases
            WHERE pur_id = ?
        `, [pur_id]);

        res.status(200).json({
            message: 'Purchase Deleted Successfully'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};


module.exports = {
    get,
    create,
    update,
    deletePurchase
};