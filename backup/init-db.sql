-- ==================== Restaurant Database Initialization ====================
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS pos_system;
USE pos_system;

-- ==================== Users Table (Staff/Admin) ====================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    role ENUM('admin', 'staff') DEFAULT 'staff',
    status TINYINT(1) DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ==================== Categories Table ====================
CREATE TABLE IF NOT EXISTS categories (
    cat_id INT AUTO_INCREMENT PRIMARY KEY,
    cat_name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    status TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cat_name (cat_name)
);

-- ==================== Brands Table ====================
CREATE TABLE IF NOT EXISTS brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    status TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_brand_name (brand_name)
);

-- ==================== Products Table ====================
CREATE TABLE IF NOT EXISTS products (
    prd_id INT AUTO_INCREMENT PRIMARY KEY,
    prd_name VARCHAR(255) NOT NULL,
    prd_description TEXT,
    prd_price DECIMAL(10, 2) NOT NULL,
    cat_id INT,
    brand_id INT,
    prd_photo VARCHAR(255),
    prd_status TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cat_id) REFERENCES categories(cat_id),
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
    INDEX idx_prd_name (prd_name),
    INDEX idx_cat_id (cat_id),
    INDEX idx_brand_id (brand_id)
);

-- ==================== Customers Table ====================
CREATE TABLE IF NOT EXISTS customers (
    cust_id INT AUTO_INCREMENT PRIMARY KEY,
    cust_name VARCHAR(255),
    cust_email VARCHAR(255) UNIQUE NOT NULL,
    cust_phone VARCHAR(20),
    cust_password VARCHAR(255),
    cust_address TEXT,
    cust_status TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cust_email (cust_email),
    INDEX idx_cust_phone (cust_phone)
);

-- ==================== Payment Methods Table ====================
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    method_code VARCHAR(50) NOT NULL UNIQUE,
    method_name VARCHAR(255) NOT NULL,
    description TEXT,
    status TINYINT(1) DEFAULT 1 COMMENT '1=active, 0=inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_method_code (method_code)
);

-- ==================== Orders Table ====================
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    cust_id INT,
    cust_email VARCHAR(255),
    delivery_address TEXT,
    total_amount DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    change_amount DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method_code VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_status VARCHAR(50) DEFAULT 'pending',
    invoice_number VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cust_id) REFERENCES customers(cust_id),
    FOREIGN KEY (payment_method_code) REFERENCES payment_methods(method_code),
    INDEX idx_cust_id (cust_id),
    INDEX idx_cust_email (cust_email),
    INDEX idx_order_status (order_status),
    INDEX idx_created_at (created_at)
);

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
    FOREIGN KEY (prd_id) REFERENCES products(prd_id),
    INDEX idx_order_id (order_id)
);

-- ==================== Insert Sample Payment Methods ====================
INSERT INTO payment_methods (method_code, method_name, description, status) VALUES
('CASH', 'Cash on Delivery', 'Pay with cash when order is delivered', 1),
('CARD', 'Credit/Debit Card', 'Pay with credit or debit card', 1),
('PAYPAL', 'PayPal', 'Pay using PayPal account', 1),
('BANK', 'Bank Transfer', 'Direct bank transfer payment', 1)
ON DUPLICATE KEY UPDATE method_name = VALUES(method_name), description = VALUES(description), status = VALUES(status);

-- ==================== Sample Data (Optional) ====================
-- Insert sample categories
INSERT INTO categories (cat_name, description, status) VALUES
('Pizzas', 'Delicious pizza options', 1),
('Burgers', 'Juicy burger selections', 1),
('Drinks', 'Beverages and drinks', 1),
('Desserts', 'Sweet treats', 1)
ON DUPLICATE KEY UPDATE cat_name = VALUES(cat_name);

-- Insert sample brands
INSERT INTO brands (brand_name, description, status) VALUES
('Foodie', 'Premium food brand', 1),
('Express', 'Fast food brand', 1),
('Gourmet', 'Gourmet cuisine brand', 1)
ON DUPLICATE KEY UPDATE brand_name = VALUES(brand_name);

-- ==================== Database Initialization Complete ====================
COMMIT;