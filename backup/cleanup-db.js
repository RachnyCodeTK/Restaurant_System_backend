const mysql = require('mysql2/promise');

async function cleanup() {
    let conn;
    try {
        console.log('Connecting to MySQL...');
        conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        console.log('Selecting pos_system database...');
        await conn.query('USE pos_system');

        console.log('\nDropping all tables...');
        const tablesToDrop = [
            'order_items',
            'orders',
            'order_items',
            'payment_methods',
            'customers',
            'products',
            'brands',
            'categories',
            'users',
            'sales',
            'sale_items',
            'cart_items',
            'cart_sessions',
            'product_adjustments'
        ];

        for (const table of tablesToDrop) {
            try {
                await conn.query(`DROP TABLE IF EXISTS ${table}`);
                console.log(`✓ Dropped: ${table}`);
            } catch (err) {
                console.log(`⚠ Could not drop ${table}:`, err.message.substring(0, 50));
            }
        }

        console.log('\n✓ Cleanup complete!');
        process.exit(0);

    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

cleanup();
