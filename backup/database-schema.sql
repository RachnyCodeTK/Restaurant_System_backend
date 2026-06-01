-- ==================== POS Restaurant System Database ====================
-- Database: pos_system
-- Purpose: Complete database schema for Restaurant POS System
-- Last Updated: 2026-05-17
-- ============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS pos_system;
USE pos_system;

-- ==================== Users Table (Staff/Admin) ====================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'manager') DEFAULT 'staff',
    status TINYINT(1) DEFAULT 1 COMMENT '1=active, 0=inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Categories Table ====================
CREATE TABLE IF NOT EXISTS categories (
    cat_id INT AUTO_INCREMENT PRIMARY KEY,
    cat_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(255),
    status TINYINT(1) DEFAULT 1 COMMENT '1=active, 0=inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cat_name (cat_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Brands Table ====================
CREATE TABLE IF NOT EXISTS brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(255),
    status TINYINT(1) DEFAULT 1 COMMENT '1=active, 0=inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_brand_name (brand_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Products Table ====================
CREATE TABLE IF NOT EXISTS products (
    prd_id INT AUTO_INCREMENT PRIMARY KEY,
    prd_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    qty INT DEFAULT 0 COMMENT 'Current stock quantity',
    photo VARCHAR(255),
    cat_id INT,
    brand_id INT,
    status TINYINT(1) DEFAULT 1 COMMENT '1=active, 0=inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cat_id) REFERENCES categories(cat_id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id) ON DELETE SET NULL,
    INDEX idx_prd_code (prd_code),
    INDEX idx_prd_name (name),
    INDEX idx_cat_id (cat_id),
    INDEX idx_brand_id (brand_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Customers Table ====================
CREATE TABLE IF NOT EXISTS customers (
    cust_id INT AUTO_INCREMENT PRIMARY KEY,
    cust_name VARCHAR(255),
    cust_email VARCHAR(255) UNIQUE NOT NULL,
    cust_phone VARCHAR(20),
    cust_password VARCHAR(255),
    cust_address TEXT,
    cust_status TINYINT(1) DEFAULT 1 COMMENT '1=active, 0=inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cust_email (cust_email),
    INDEX idx_cust_phone (cust_phone),
    INDEX idx_cust_status (cust_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Payment Methods Table ====================
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    method_code VARCHAR(50) NOT NULL UNIQUE,
    method_name VARCHAR(255) NOT NULL,
    description TEXT,
    status TINYINT(1) DEFAULT 1 COMMENT '1=active, 0=inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_method_code (method_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Orders Table ====================
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    cust_id INT,
    cust_email VARCHAR(255),
    delivery_address TEXT,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    change_amount DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method_code VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, completed, failed, refunded',
    order_status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, completed, cancelled, processing',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cust_id) REFERENCES customers(cust_id) ON DELETE SET NULL,
    FOREIGN KEY (payment_method_code) REFERENCES payment_methods(method_code),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_cust_id (cust_id),
    INDEX idx_cust_email (cust_email),
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_status (order_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Order Items Table ====================
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    prd_id INT,
    item_qty INT DEFAULT 1,
    item_price DECIMAL(10, 2),
    item_total DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (prd_id) REFERENCES products(prd_id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_prd_id (prd_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Transactions/Payments Table (Optional) ====================
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method_code VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    reference_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, completed, failed, refunded',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_code) REFERENCES payment_methods(method_code),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Stock Adjustments Table (Inventory) ====================
CREATE TABLE IF NOT EXISTS stock_adjustments (
    adjustment_id INT AUTO_INCREMENT PRIMARY KEY,
    prd_id INT NOT NULL,
    adjustment_qty INT NOT NULL COMMENT 'positive=add, negative=remove',
    reason VARCHAR(255) COMMENT 'damaged, theft, inventory_count, return, etc',
    notes TEXT,
    adjusted_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prd_id) REFERENCES products(prd_id) ON DELETE CASCADE,
    FOREIGN KEY (adjusted_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_prd_id (prd_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Audit Log Table ====================
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) COMMENT 'CREATE, UPDATE, DELETE, LOGIN, etc',
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== SEED DATA ====================

-- Insert Default Payment Methods
INSERT INTO payment_methods (method_code, method_name, description, status) VALUES
('CASH', 'Cash', 'Payment in cash', 1),
('CARD', 'Credit/Debit Card', 'Payment with credit or debit card', 1),
('PAYPAL', 'PayPal', 'Payment using PayPal account', 1),
('BANK', 'Bank Transfer', 'Direct bank transfer payment', 1),
('WALLET', 'Digital Wallet', 'Payment via digital wallet', 1)
ON DUPLICATE KEY UPDATE method_name = VALUES(method_name), description = VALUES(description), status = VALUES(status);

-- Insert Sample Categories
INSERT INTO categories (cat_name, description, image, status) VALUES
('Pizzas', 'Delicious homemade pizza options', 'pizzas.jpg', 1),
('Burgers', 'Juicy and fresh burger selections', 'burgers.jpg', 1),
('Drinks', 'Beverages, sodas, juices and water', 'drinks.jpg', 1),
('Desserts', 'Sweet treats and desserts', 'desserts.jpg', 1),
('Appetizers', 'Starters and appetizers', 'appetizers.jpg', 1),
('Salads', 'Fresh and healthy salad options', 'salads.jpg', 1)
ON DUPLICATE KEY UPDATE cat_name = VALUES(cat_name);

-- Insert Sample Brands
INSERT INTO brands (brand_name, description, image, status) VALUES
('Premium Cuisine', 'High quality premium food brand', 'premium.jpg', 1),
('Express Fast Food', 'Quick service fast food brand', 'express.jpg', 1),
('Gourmet Kitchen', 'Gourmet cuisine and fine dining', 'gourmet.jpg', 1),
('Fresh Organic', 'Fresh and organic ingredients', 'organic.jpg', 1)
ON DUPLICATE KEY UPDATE brand_name = VALUES(brand_name);

-- Insert Sample Products
INSERT INTO products (prd_code, name, price, qty, cat_id, brand_id, status) VALUES
('PROD-001', 'Margherita Pizza', 12.99, 50, 1, 1, 1),
('PROD-002', 'Pepperoni Pizza', 14.99, 45, 1, 1, 1),
('PROD-003', 'Classic Burger', 8.99, 100, 2, 2, 1),
('PROD-004', 'Deluxe Burger', 12.99, 80, 2, 1, 1),
('PROD-005', 'Coca Cola', 2.99, 200, 3, 3, 1),
('PROD-006', 'Iced Tea', 3.49, 150, 3, 3, 1),
('PROD-007', 'Chocolate Cake', 6.99, 30, 4, 1, 1),
('PROD-008', 'Ice Cream', 4.99, 60, 4, 1, 1),
('PROD-009', 'Chicken Wings', 9.99, 70, 5, 2, 1),
('PROD-010', 'Caesar Salad', 7.99, 40, 6, 4, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price);

-- Insert Sample Admin User
INSERT INTO users (name, email, password, role, status) VALUES
('Admin User', 'admin@pos.local', '$2b$10$YkZ3n8fJ7wN5qL2pX9mK6e1D4c3B7v8A9d0E2f1G3h4I5j6K7l8M9', 'admin', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert Sample Customer
INSERT INTO customers (cust_name, cust_email, cust_phone, cust_address, cust_status) VALUES
('John Doe', 'john@example.com', '+1-234-567-8900', '123 Main Street, City, State 12345', 1),
('Jane Smith', 'jane@example.com', '+1-234-567-8901', '456 Oak Avenue, City, State 12346', 1)
ON DUPLICATE KEY UPDATE cust_name = VALUES(cust_name);

-- ==================== CREATE INDEXES FOR PERFORMANCE ====================
-- Already created with table definitions

-- ==================== DATABASE INITIALIZATION COMPLETE ====================
-- Collation: UTF-8 (Unicode) for international support
-- Engine: InnoDB for transaction support and foreign keys
-- Status: Ready for production
COMMIT;
