-- ==================== DATABASE SETUP GUIDE ====================
-- Quick Reference for Restaurant POS System Database

-- ==================== 1. CREATE DATABASE ====================
CREATE DATABASE IF NOT EXISTS pos_system;
USE pos_system;

-- ==================== 2. VERIFY TABLES ====================
SHOW TABLES;

-- Expected Tables:
-- - users
-- - categories
-- - brands
-- - products
-- - customers
-- - payment_methods
-- - orders
-- - order_items
-- - transactions
-- - stock_adjustments
-- - audit_logs

-- ==================== 3. CHECK TABLE STRUCTURES ====================
DESCRIBE users;
DESCRIBE categories;
DESCRIBE brands;
DESCRIBE products;
DESCRIBE customers;
DESCRIBE payment_methods;
DESCRIBE orders;
DESCRIBE order_items;
DESCRIBE transactions;
DESCRIBE stock_adjustments;
DESCRIBE audit_logs;

-- ==================== 4. VERIFY SAMPLE DATA ====================
SELECT COUNT(*) as payment_methods_count FROM payment_methods;
SELECT COUNT(*) as categories_count FROM categories;
SELECT COUNT(*) as brands_count FROM brands;
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as users_count FROM users;

-- Display sample payment methods
SELECT method_code, method_name FROM payment_methods;

-- Display sample categories
SELECT cat_id, cat_name FROM categories;

-- Display sample products with category and brand
SELECT p.prd_id, p.prd_code, p.name, p.price, p.qty, c.cat_name, b.brand_name
FROM products p
LEFT JOIN categories c ON p.cat_id = c.cat_id
LEFT JOIN brands b ON p.brand_id = b.brand_id
LIMIT 10;

-- ==================== 5. KEY INDEXES ====================
-- Check if all indexes are created properly
SHOW INDEX FROM products;
SHOW INDEX FROM orders;
SHOW INDEX FROM customers;
SHOW INDEX FROM payment_methods;

-- ==================== 6. DATABASE STATISTICS ====================
-- Check database size
SELECT 
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'pos_system'
ORDER BY (data_length + index_length) DESC;

-- ==================== 7. FOREIGN KEY VERIFICATION ====================
-- Check all foreign key relationships
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'pos_system'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ==================== 8. CREATE TEST ORDER ====================
-- Insert test data for development/testing

-- 1. Create test customer
INSERT INTO customers (cust_name, cust_email, cust_phone, cust_address, cust_status)
VALUES ('Test Customer', 'test@example.com', '+1-555-0000', '123 Test St', 1);

-- Get the inserted customer ID (usually auto-incremented)
SELECT LAST_INSERT_ID() as test_customer_id;

-- 2. Create test order
INSERT INTO orders (
    invoice_number,
    cust_id,
    delivery_address,
    total_amount,
    paid_amount,
    currency,
    payment_method_code,
    payment_status,
    order_status,
    description
) VALUES (
    CONCAT('TEST-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')),
    1,
    '123 Test St',
    25.98,
    25.98,
    'USD',
    'CASH',
    'completed',
    'completed',
    'Test Order'
);

-- Get the inserted order ID
SELECT LAST_INSERT_ID() as test_order_id;

-- 3. Add items to test order
INSERT INTO order_items (order_id, prd_id, item_qty, item_price, item_total)
VALUES 
    (1, 1, 2, 12.99, 25.98);

-- 4. View test order
SELECT 
    o.order_id,
    o.invoice_number,
    o.total_amount,
    oi.prd_id,
    p.name as product_name,
    oi.item_qty,
    oi.item_price
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.prd_id = p.prd_id
WHERE o.order_id = 1;

-- ==================== 9. IMPORTANT QUERY PATTERNS ====================

-- Get all orders with customer and product details
SELECT 
    o.order_id,
    o.invoice_number,
    c.cust_name,
    c.cust_email,
    o.total_amount,
    o.paid_amount,
    pm.method_name,
    o.order_status,
    o.created_at
FROM orders o
LEFT JOIN customers c ON o.cust_id = c.cust_id
LEFT JOIN payment_methods pm ON o.payment_method_code = pm.method_code
ORDER BY o.created_at DESC;

-- Get current product inventory
SELECT 
    p.prd_id,
    p.prd_code,
    p.name,
    p.price,
    p.qty as current_stock,
    c.cat_name,
    b.brand_name,
    CASE 
        WHEN p.qty < 10 THEN 'LOW STOCK'
        WHEN p.qty < 5 THEN 'CRITICAL'
        ELSE 'GOOD'
    END as stock_status
FROM products p
LEFT JOIN categories c ON p.cat_id = c.cat_id
LEFT JOIN brands b ON p.brand_id = b.brand_id
WHERE p.status = 1
ORDER BY p.qty ASC;

-- Get sales summary by date
SELECT 
    DATE(created_at) as sale_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    SUM(discount_amount) as total_discounts
FROM orders
WHERE order_status = 'completed'
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- Get revenue by payment method
SELECT 
    pm.method_code,
    pm.method_name,
    COUNT(o.order_id) as transaction_count,
    SUM(o.paid_amount) as total_revenue,
    AVG(o.paid_amount) as avg_transaction
FROM payment_methods pm
LEFT JOIN orders o ON pm.method_code = o.payment_method_code 
    AND o.payment_status = 'completed'
GROUP BY pm.method_code, pm.method_name
ORDER BY total_revenue DESC;

-- ==================== 10. CLEANUP & MAINTENANCE ====================

-- Delete test data (use with caution!)
-- DELETE FROM order_items WHERE order_id = 1;
-- DELETE FROM orders WHERE order_id = 1;
-- DELETE FROM customers WHERE cust_id = 1;

-- Remove inactive customers (archived customers)
-- DELETE FROM customers WHERE cust_status = 0 AND updated_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Archive old completed orders
-- Move completed orders older than 1 year to archive table
-- (Ensure you have an orders_archive table first)
-- INSERT INTO orders_archive SELECT * FROM orders WHERE order_status = 'completed' AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
-- DELETE FROM orders WHERE order_status = 'completed' AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- ==================== 11. BACKUP ====================
-- Command line backup:
-- mysqldump -u root -p pos_system > backup_pos_system_$(date +%Y%m%d).sql

-- Schedule daily backup (Linux cron example):
-- 0 2 * * * mysqldump -u root -pYOURPASSWORD pos_system > /backups/pos_system_$(date +\%Y\%m\%d).sql

-- ==================== 12. MONITORING ====================

-- Check for slow queries
-- SET GLOBAL slow_query_log = 'ON';
-- SET GLOBAL long_query_time = 2;

-- Monitor connections
-- SHOW PROCESSLIST;

-- Monitor table status
-- SHOW TABLE STATUS FROM pos_system;

-- Optimize tables
-- OPTIMIZE TABLE users;
-- OPTIMIZE TABLE products;
-- OPTIMIZE TABLE orders;

-- ==================== END OF SETUP GUIDE ====================
