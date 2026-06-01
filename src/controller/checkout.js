const checkout = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const {
            customer_name,
            payment_method,
            cart,
            total_amount
        } = req.body;

        const [saleResult] = await connection.query(
            `INSERT INTO sales
            (customer_name, payment_method, total_amount)
            VALUES (?, ?, ?)`,
            [customer_name, payment_method, total_amount]
        );

        const saleId = saleResult.insertId;

        for (const item of cart) {

            const [product] = await connection.query(
                'SELECT qty FROM products WHERE prd_id = ?',
                [item.prd_id]
            );

            if (product[0].qty < item.qty) {
                throw new Error(`Insufficient stock for ${item.name}`);
            }

            await connection.query(
                `INSERT INTO sale_items
                (sale_id, product_id, qty, price, subtotal)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    saleId,
                    item.prd_id,
                    item.qty,
                    item.price,
                    item.qty * item.price
                ]
            );

            await connection.query(
                `UPDATE products
                SET qty = qty - ?
                WHERE prd_id = ?`,
                [item.qty, item.prd_id]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            sale_id: saleId
        });

    } catch (err) {

        await connection.rollback();

        res.status(500).json({
            success: false,
            message: err.message
        });

    } finally {
        connection.release();
    }
};