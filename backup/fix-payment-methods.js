const db = require('./src/config/db');

const fixPaymentMethods = async () => {
    try {
        console.log('Checking payment methods...');
        
        // Check what's currently in the database
        const [existingMethods] = await db.query('SELECT * FROM payment_methods');
        console.log('Current payment methods:', existingMethods.map(m => m.method_code));
        
        // Ensure CARD and CASH exist (for POS frontend compatibility)
        const methods = [
            ['CARD', 'Credit/Debit Card', 'Pay with credit or debit card', 1],
            ['CASH', 'Cash on Delivery', 'Pay with cash when order is delivered', 1]
        ];
        
        for (const method of methods) {
            const [existing] = await db.query(
                'SELECT * FROM payment_methods WHERE method_code = ?',
                [method[0]]
            );
            
            if (existing.length === 0) {
                await db.query(
                    'INSERT INTO payment_methods (method_code, method_name, description, status) VALUES (?, ?, ?, ?)',
                    method
                );
                console.log(`✅ Added: ${method[0]}`);
            } else {
                console.log(`✅ Already exists: ${method[0]}`);
            }
        }
        
        // Verify all active payment methods
        const [allMethods] = await db.query('SELECT method_code, method_name, status FROM payment_methods WHERE status = 1 ORDER BY method_code');
        console.log('\n✅ Active payment methods:');
        console.table(allMethods);
        
        console.log('\n✅ Payment methods fixed successfully!');
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

fixPaymentMethods();
