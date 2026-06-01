const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });
        
        console.log('Connected to MySQL server');

        // Read the SQL file
        const sqlFile = path.join(__dirname, 'init-db.sql');
        let sql;
        
        try {
            sql = fs.readFileSync(sqlFile, 'utf8');
        } catch (err) {
            console.error('Error reading SQL file:', err);
            process.exit(1);
        }

        // Split statements properly - remove comments and split by semicolon
        const statements = sql
            .split('\n')
            .map(line => line.split('--')[0].trim()) // Remove SQL comments
            .join('\n')
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0); // Remove empty statements

        console.log(`\nExecuting ${statements.length} SQL statements sequentially...\n`);

        let lastDbSet = false;
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            
            // Check if this is a USE statement
            if (stmt.toUpperCase().startsWith('USE')) {
                lastDbSet = true;
            }
            
            try {
                const [result] = await connection.query(stmt);
                const displayStmt = stmt.substring(0, 50).replace(/\n/g, ' ') + (stmt.length > 50 ? '...' : '');
                console.log(`[${i + 1}/${statements.length}] ✓ ${displayStmt}`);
            } catch (err) {
                if (err.code === 'ER_DB_CREATE_EXISTS' || err.code === 'ER_TABLE_EXISTS_ERROR') {
                    const displayStmt = stmt.substring(0, 50).replace(/\n/g, ' ') + (stmt.length > 50 ? '...' : '');
                    console.log(`[${i + 1}/${statements.length}] ⊘ ${displayStmt} (already exists)`);
                } else if (err.sqlState === '42S02') {
                    // Table doesn't exist error - might be OK for DROP or ALTER
                    const displayStmt = stmt.substring(0, 50).replace(/\n/g, ' ') + (stmt.length > 50 ? '...' : '');
                    console.log(`[${i + 1}/${statements.length}] ⊘ ${displayStmt} (table not found - OK for DROP/ALTER)`);
                } else {
                    console.error(`\n[${i + 1}/${statements.length}] ✗ Error:`, err.message);
                    console.error('   Statement:', stmt.substring(0, 100));
                    throw err;
                }
            }
        }
        
        console.log('\n✓ Database initialization completed successfully!');
        
        // Verify tables were created
        const [tables] = await connection.query('SHOW TABLES FROM pos_system');
        console.log('\n✓ Tables created in pos_system database:');
        tables.forEach(row => {
            const tableName = Object.values(row)[0];
            console.log(`  - ${tableName}`);
        });
        
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

initializeDatabase();
