const db = require('./src/config/db');

const fixOrdersTable = async () => {
    try {
        console.log('Checking orders table columns...');
        
        // Get current table structure
        const [columns] = await db.query("SHOW COLUMNS FROM orders");
        const existingColumns = columns.map(col => col.Field);
        console.log('Existing columns:', existingColumns);
        
        // Define columns to add if missing
        const columnsToAdd = [
            { name: 'cust_email', sql: 'ALTER TABLE orders ADD COLUMN cust_email VARCHAR(255) AFTER cust_id' },
            { name: 'discount_amount', sql: 'ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0 AFTER total_amount' },
            { name: 'paid_amount', sql: 'ALTER TABLE orders ADD COLUMN paid_amount DECIMAL(10, 2) DEFAULT 0' },
            { name: 'change_amount', sql: 'ALTER TABLE orders ADD COLUMN change_amount DECIMAL(10, 2) DEFAULT 0' },
            { name: 'currency', sql: 'ALTER TABLE orders ADD COLUMN currency VARCHAR(10) DEFAULT "USD"' },
            { name: 'invoice_number', sql: 'ALTER TABLE orders ADD COLUMN invoice_number VARCHAR(100)' },
            { name: 'description', sql: 'ALTER TABLE orders ADD COLUMN description TEXT' }
        ];
        
        for (const col of columnsToAdd) {
            if (!existingColumns.includes(col.name)) {
                try {
                    await db.query(col.sql);
                    console.log(`✅ Added column: ${col.name}`);
                } catch (err) {
                    console.log(`⚠️  Could not add ${col.name}:`, err.message);
                }
            } else {
                console.log(`✅ Column already exists: ${col.name}`);
            }
        }
        
        // Verify all columns
        const [finalColumns] = await db.query("SHOW COLUMNS FROM orders");
        console.log('\n✅ Orders table columns after fix:');
        console.table(finalColumns.map(col => ({ Field: col.Field, Type: col.Type })));
        
        console.log('\n✅ Orders table fixed successfully!');
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

fixOrdersTable();
