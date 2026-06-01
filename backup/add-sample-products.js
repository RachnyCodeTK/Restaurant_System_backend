const db = require('./src/config/db');

async function addSampleProducts() {
    try {
        console.log('Checking database tables...');

        // Check table structure
        const [columns] = await db.query("DESCRIBE products");
        console.log('Products table columns:', columns.map(col => col.Field));

        console.log('Adding sample products...');

        // Use the correct column names based on what we find
        const columnNames = columns.map(col => col.Field);
        const nameCol = columnNames.find(col => col.includes('name')) || 'prd_name';
        const descCol = columnNames.find(col => col.includes('description')) || 'prd_description';
        const priceCol = columnNames.find(col => col.includes('price')) || 'prd_price';
        const statusCol = columnNames.find(col => col.includes('status')) || 'prd_status';

        const products = [
            {
                name: 'Margherita Pizza',
                description: 'Fresh mozzarella cheese with tomato sauce and basil',
                price: 12.99,
                cat_id: 1,
                brand_id: 1,
                qty: 100,
                status: 1
            },
            {
                name: 'Pepperoni Pizza',
                description: 'Classic pepperoni pizza with extra cheese',
                price: 14.99,
                cat_id: 1,
                brand_id: 1,
                qty: 100,
                status: 1
            },
            {
                name: 'Veggie Supreme Pizza',
                description: 'Loaded with fresh vegetables and herbs',
                price: 13.99,
                cat_id: 1,
                brand_id: 1,
                qty: 100,
                status: 1
            },
            {
                name: 'Meat Lovers Pizza',
                description: 'Bacon, ham, sausage, and beef toppings',
                price: 16.99,
                cat_id: 1,
                brand_id: 1,
                qty: 100,
                status: 1
            },
            {
                name: 'BBQ Chicken Pizza',
                description: 'Grilled chicken with BBQ sauce and onions',
                price: 15.99,
                cat_id: 1,
                brand_id: 1,
                qty: 100,
                status: 1
            },
            {
                name: 'Classic Cheeseburger',
                description: 'Juicy beef patty with cheese and fresh toppings',
                price: 9.99,
                cat_id: 2,
                brand_id: 2,
                qty: 50,
                status: 1
            },
            {
                name: 'Bacon Burger',
                description: 'Cheeseburger with crispy bacon strips',
                price: 11.99,
                cat_id: 2,
                brand_id: 2,
                qty: 50,
                status: 1
            },
            {
                name: 'Coca Cola',
                description: 'Refreshing cola drink',
                price: 2.99,
                cat_id: 3,
                brand_id: 1,
                qty: 200,
                status: 1
            },
            {
                name: 'Chocolate Cake',
                description: 'Rich chocolate cake with frosting',
                price: 6.99,
                cat_id: 4,
                brand_id: 3,
                qty: 30,
                status: 1
            }
        ];

        for (const product of products) {
            const sql = `INSERT INTO products (name, price, qty, cat_id, brand_id, status) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`;
            await db.query(sql, [product.name, product.price, product.qty, product.cat_id, product.brand_id, product.status]);
        }

        console.log('Sample products added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addSampleProducts();