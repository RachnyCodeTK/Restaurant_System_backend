-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    method_code VARCHAR(50) NOT NULL UNIQUE,
    method_name VARCHAR(255) NOT NULL,
    description TEXT,
    status TINYINT(1) DEFAULT 1 COMMENT '1=active, 0=inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample payment methods
INSERT INTO payment_methods (method_code, method_name, description, status) VALUES
('cash', 'Cash on Delivery', 'Pay with cash when order is delivered', 1),
('card', 'Credit/Debit Card', 'Pay with credit or debit card', 1),
('paypal', 'PayPal', 'Pay using PayPal account', 1),
('bank', 'Bank Transfer', 'Direct bank transfer payment', 1)
ON DUPLICATE KEY UPDATE method_name = VALUES(method_name), description = VALUES(description), status = VALUES(status);

-- Add payment_method_code to orders table if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_code VARCHAR(50) AFTER payment_status;

-- Add foreign key constraint (optional, but recommended)
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_payment_method FOREIGN KEY (payment_method_code) REFERENCES payment_methods(method_code);