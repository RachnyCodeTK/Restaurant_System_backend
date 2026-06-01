const db = require('./src/config/db');

const fixOrderItemsTable = async () => {
    try {
        console.log('Checking order_items table columns...');
        
        // Get current table structure
        const [columns] = await db.query("SHOW COLUMNS FROM order_items");
        const existingColumns = columns.map(col => col.Field);
        console.log('Existing columns:', existingColumns);
        
        // Define columns to add if missing
        const columnsToAdd = [
            { name: 'item_qty', sql: 'ALTER TABLE order_items ADD COLUMN item_qty INT DEFAULT 1' },
            { name: 'item_price', sql: 'ALTER TABLE order_items ADD COLUMN item_price DECIMAL(10, 2)' },
            { name: 'item_total', sql: 'ALTER TABLE order_items ADD COLUMN item_total DECIMAL(10, 2)' }
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
        const [finalColumns] = await db.query("SHOW COLUMNS FROM order_items");
        console.log('\n✅ Order_items table columns after fix:');
        console.table(finalColumns.map(col => ({ Field: col.Field, Type: col.Type })));
        
        console.log('\n✅ Order_items table fixed successfully!');
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

fixOrderItemsTable();
