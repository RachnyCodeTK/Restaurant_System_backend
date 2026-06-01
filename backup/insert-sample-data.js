const mysql = require('mysql2/promise');

async function insertSampleData() {
    let connection;
    try {
        // Connect directly to the pos_system database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'pos_system'
        });
        
        console.log('Connected to pos_system database');

        // Insert payment methods
        console.log('\nInserting payment methods...');
        try {
            await connection.query(`
                INSERT INTO payment_methods (method_code, method_name, description, status) VALUES
                ('CASH', 'Cash on Delivery', 'Pay with cash when order is delivered', 1),
                ('CARD', 'Credit/Debit Card', 'Pay with credit or debit card', 1),
                ('PAYPAL', 'PayPal', 'Pay using PayPal account', 1),
                ('BANK', 'Bank Transfer', 'Direct bank transfer payment', 1)
                ON DUPLICATE KEY UPDATE method_name = VALUES(method_name), description = VALUES(description), status = VALUES(status)
            `);
            console.log('✓ Payment methods inserted');
        } catch (err) {
            console.error('✗ Error inserting payment methods:', err.message);
        }

        // Insert sample categories
        console.log('\nInserting sample categories...');
        try {
            await connection.query(`
                INSERT INTO categories (cat_name, description, status) VALUES
                ('Pizzas', 'Delicious pizza options', 1),
                ('Burgers', 'Juicy burger selections', 1),
                ('Drinks', 'Beverages and drinks', 1),
                ('Desserts', 'Sweet treats', 1)
                ON DUPLICATE KEY UPDATE cat_name = VALUES(cat_name)
            `);
            console.log('✓ Sample categories inserted');
        } catch (err) {
            console.error('✗ Error inserting categories:', err.message);
        }

        // Insert sample brands
        console.log('\nInserting sample brands...');
        try {
            await connection.query(`
                INSERT INTO brands (brand_name, description, status) VALUES
                ('Foodie', 'Premium food brand', 1),
                ('Express', 'Fast food brand', 1),
                ('Gourmet', 'Gourmet cuisine brand', 1)
                ON DUPLICATE KEY UPDATE brand_name = VALUES(brand_name)
            `);
            console.log('✓ Sample brands inserted');
        } catch (err) {
            console.error('✗ Error inserting brands:', err.message);
        }

        console.log('\n✓ Sample data insertion completed!');
        
        // Verify data
        const [paymentMethods] = await connection.query('SELECT * FROM payment_methods');
        console.log(`\n✓ Payment methods in database: ${paymentMethods.length}`);

        const [categories] = await connection.query('SELECT * FROM categories');
        console.log(`✓ Categories in database: ${categories.length}`);

        const [brands] = await connection.query('SELECT * FROM brands');
        console.log(`✓ Brands in database: ${brands.length}`);

        await connection.end();
        console.log('\n✓ Connection closed');
        process.exit(0);
        
    } catch (err) {
        console.error('\n✗ Fatal Error:', err.message);
        if (connection) {
            try {
                await connection.end();
            } catch (e) {}
        }
        process.exit(1);
    }
}

insertSampleData();
