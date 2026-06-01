# Restaurant POS System - Database Documentation

## Overview
This document describes the complete MySQL database schema for the Restaurant Point-of-Sale (POS) System, including all tables, relationships, and their purpose.

---

## Database: `pos_system`

### 1. **Users Table** - Staff & Admin Management
**Purpose:** Store staff members and admin users who manage the restaurant system.

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | INT | PK | Auto-increment primary key |
| name | VARCHAR(255) | | Staff member full name |
| email | VARCHAR(255) | UQ | Unique email address for login |
| password | VARCHAR(255) | | Hashed password (bcrypt) |
| role | ENUM | | admin, staff, or manager |
| status | TINYINT(1) | | 1=active, 0=inactive |
| created_at | TIMESTAMP | | Record creation time |
| updated_at | TIMESTAMP | | Last update time |

**Related Routes:**
- `POST /api/user` - Create user (userController.js)
- `GET /api/user` - Get all users
- `GET /api/user/:id` - Get specific user
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user
- `POST /api/user/login` - User login
- `POST /api/user/sendOTP` - Send OTP for password reset
- `POST /api/user/verifyOTP` - Verify OTP
- `POST /api/user/resetPassword` - Reset password

---

### 2. **Categories Table** - Product Categories
**Purpose:** Organize products into categories.

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| cat_id | INT | PK | Auto-increment primary key |
| cat_name | VARCHAR(255) | UQ | Unique category name |
| description | TEXT | | Category description |
| image | VARCHAR(255) | | Image filename for category |
| status | TINYINT(1) | | 1=active, 0=inactive |
| created_at | TIMESTAMP | | Record creation time |
| updated_at | TIMESTAMP | | Last update time |

**Related Routes:**
- `GET /api/category` - Get all categories (categoryController.js)
- `GET /api/category/search` - Search categories by name
- `POST /api/category` - Create category (with image upload)
- `PUT /api/category/:code` - Update category
- `DELETE /api/category/:code` - Delete category

---

### 3. **Brands Table** - Product Brands
**Purpose:** Store product brand information.

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| brand_id | INT | PK | Auto-increment primary key |
| brand_name | VARCHAR(255) | UQ | Unique brand name |
| description | TEXT | | Brand description |
| image | VARCHAR(255) | | Logo/image filename |
| status | TINYINT(1) | | 1=active, 0=inactive |
| created_at | TIMESTAMP | | Record creation time |
| updated_at | TIMESTAMP | | Last update time |

**Related Routes:**
- `GET /api/brand` - Get all brands (brandController.js)
- `GET /api/brand/search` - Search brands by name
- `POST /api/brand` - Create brand (with logo upload)
- `PUT /api/brand/:code` - Update brand
- `DELETE /api/brand/:code` - Delete brand

---

### 4. **Products Table** - Menu Items/Products
**Purpose:** Store restaurant menu items and products with pricing and inventory.

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| prd_id | INT | PK | Auto-increment primary key |
| prd_code | VARCHAR(100) | UQ | Unique product code/SKU |
| name | VARCHAR(255) | | Product name |
| price | DECIMAL(10,2) | | Unit price |
| qty | INT | | Current stock quantity |
| photo | VARCHAR(255) | | Product image filename |
| cat_id | INT | FK | Category ID (foreign key) |
| brand_id | INT | FK | Brand ID (foreign key) |
| status | TINYINT(1) | | 1=active, 0=inactive |
| created_at | TIMESTAMP | | Record creation time |
| updated_at | TIMESTAMP | | Last update time |

**Related Routes:**
- `GET /api/product` - Get all products (productController.js)
- `GET /api/product/search` - Search products by code/name
- `GET /api/product/:id` - Get specific product
- `POST /api/product` - Create product (with photo upload)
- `PUT /api/product` - Update product
- `DELETE /api/product/:prd_id` - Delete product
- `POST /api/product/adjustment` - Adjust stock quantity

**Relationships:**
- Foreign Key to `categories(cat_id)`
- Foreign Key to `brands(brand_id)`

---

### 5. **Customers Table** - Customer Information
**Purpose:** Store customer profile and authentication data for online orders.

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| cust_id | INT | PK | Auto-increment primary key |
| cust_name | VARCHAR(255) | | Customer full name |
| cust_email | VARCHAR(255) | UQ | Unique email address |
| cust_phone | VARCHAR(20) | | Contact phone number |
| cust_password | VARCHAR(255) | | Hashed password (bcrypt) |
| cust_address | TEXT | | Delivery/billing address |
| cust_status | TINYINT(1) | | 1=active, 0=inactive |
| created_at | TIMESTAMP | | Account creation time |
| updated_at | TIMESTAMP | | Last update time |

**Related Routes:**
- `POST /api/customer/register` - Customer registration (customerController.js)
- `POST /api/customer/login` - Customer login
- `POST /api/customer/logout` - Customer logout
- `GET /api/customer` - Get all customers (admin)
- `GET /api/customer/:id` - Get specific customer
- `GET /api/customer/search` - Search customers
- `GET /api/customer/profile` - Get logged-in customer profile
- `PUT /api/customer` - Update customer profile
- `PUT /api/customer/change-password` - Change password
- `DELETE /api/customer/:id` - Delete customer

---

### 6. **Payment Methods Table** - Payment Options
**Purpose:** Store available payment methods for orders.

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | INT | PK | Auto-increment primary key |
| method_code | VARCHAR(50) | UQ | Unique payment method code (e.g., CASH, CARD) |
| method_name | VARCHAR(255) | | Display name (e.g., "Credit Card") |
| description | TEXT | | Method description |
| status | TINYINT(1) | | 1=active, 0=inactive |
| created_at | TIMESTAMP | | Record creation time |
| updated_at | TIMESTAMP | | Last update time |

**Sample Data:**
- CASH - Cash on Delivery
- CARD - Credit/Debit Card
- PAYPAL - PayPal
- BANK - Bank Transfer
- WALLET - Digital Wallet

**Related Routes:**
- `GET /api/payment-method` - Get all payment methods (paymentMethodController.js)
- `GET /api/payment-method/:code` - Get specific payment method
- `POST /api/payment-method` - Create payment method
- `PUT /api/payment-method/:code` - Update payment method
- `DELETE /api/payment-method/:code` - Delete payment method

---

### 7. **Orders Table** - Customer Orders
**Purpose:** Store all customer orders from checkout/POS transactions.

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| order_id | INT | PK | Auto-increment primary key |
| invoice_number | VARCHAR(100) | UQ | Unique invoice number |
| cust_id | INT | FK | Customer ID (nullable for guest orders) |
| cust_email | VARCHAR(255) | | Customer email (for guest orders) |
| delivery_address | TEXT | | Delivery address |
| total_amount | DECIMAL(10,2) | | Order total before discount |
| discount_amount | DECIMAL(10,2) | | Applied discount |
| paid_amount | DECIMAL(10,2) | | Amount paid |
| change_amount | DECIMAL(10,2) | | Change given |
| currency | VARCHAR(10) | | Currency code (USD, EUR, etc) |
| payment_method_code | VARCHAR(50) | FK | Payment method code |
| payment_status | VARCHAR(50) | | pending, completed, failed, refunded |
| order_status | VARCHAR(50) | | pending, completed, cancelled, processing |
| description | TEXT | | Order description/items summary |
| created_at | TIMESTAMP | | Order creation time |
| updated_at | TIMESTAMP | | Last update time |

**Related Routes:**
- `POST /api/customer/order` - Place new order (customerOrderController.js)
- `GET /api/customer/orders` - Get customer's orders
- `GET /api/customer/orders/track` - Track order by email
- `GET /api/customer/order/:order_id` - Get order details
- `DELETE /api/customer/order/:order_id` - Cancel order
- `GET /api/orders` - Get all orders (admin/reports)

**Relationships:**
- Foreign Key to `customers(cust_id)` ON DELETE SET NULL
- Foreign Key to `payment_methods(method_code)`

---

### 8. **Order Items Table** - Items in Each Order
**Purpose:** Store individual items within each order.

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| order_item_id | INT | PK | Auto-increment primary key |
| order_id | INT | FK | Order ID (required) |
| prd_id | INT | FK | Product ID |
| item_qty | INT | | Quantity ordered |
| item_price | DECIMAL(10,2) | | Unit price at time of order |
| item_total | DECIMAL(10,2) | | Total for this item (qty × price) |
| created_at | TIMESTAMP | | Record creation time |

**Relationships:**
- Foreign Key to `orders(order_id)` ON DELETE CASCADE
- Foreign Key to `products(prd_id)` ON DELETE SET NULL

---

### 9. **Transactions Table** - Payment Transactions (Optional)
**Purpose:** Track detailed payment transactions for auditing and refunds.

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| transaction_id | INT | PK | Auto-increment primary key |
| order_id | INT | FK | Associated order |
| payment_method_code | VARCHAR(50) | FK | Payment method used |
| amount | DECIMAL(10,2) | | Transaction amount |
| reference_number | VARCHAR(100) | | External reference (e.g., gateway ID) |
| status | VARCHAR(50) | | pending, completed, failed, refunded |
| notes | TEXT | | Additional notes |
| created_at | TIMESTAMP | | Transaction time |
| updated_at | TIMESTAMP | | Last update time |

**Relationships:**
- Foreign Key to `orders(order_id)` ON DELETE CASCADE
- Foreign Key to `payment_methods(method_code)`

---

### 10. **Stock Adjustments Table** - Inventory Management
**Purpose:** Track inventory adjustments (damage, loss, correction).

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| adjustment_id | INT | PK | Auto-increment primary key |
| prd_id | INT | FK | Product ID |
| adjustment_qty | INT | | Quantity adjusted (positive=add, negative=remove) |
| reason | VARCHAR(255) | | Reason (damaged, theft, inventory_count, return) |
| notes | TEXT | | Additional notes |
| adjusted_by | INT | FK | User ID who made adjustment |
| created_at | TIMESTAMP | | Adjustment time |

**Relationships:**
- Foreign Key to `products(prd_id)` ON DELETE CASCADE
- Foreign Key to `users(id)` ON DELETE SET NULL

---

### 11. **Audit Logs Table** - System Audit Trail
**Purpose:** Log all important actions for compliance and troubleshooting.

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| log_id | INT | PK | Auto-increment primary key |
| user_id | INT | FK | User who performed action |
| action | VARCHAR(100) | | Action type (CREATE, UPDATE, DELETE, LOGIN) |
| table_name | VARCHAR(100) | | Affected table |
| record_id | INT | | Record ID affected |
| old_values | JSON | | Previous values (for updates) |
| new_values | JSON | | New values (for updates) |
| ip_address | VARCHAR(45) | | IP address of user |
| user_agent | TEXT | | Browser/client info |
| created_at | TIMESTAMP | | Log creation time |

**Relationships:**
- Foreign Key to `users(id)` ON DELETE SET NULL

---

## Entity Relationship Diagram

```
users (Admin/Staff)
  ↑
  ├─ audit_logs (many:one)

categories
  ↑
  ├─ products (one:many)

brands
  ↑
  ├─ products (one:many)

products
  ↑
  ├─ order_items (one:many)
  └─ stock_adjustments (one:many)
      ↓
      adjusted_by → users

customers
  ↑
  ├─ orders (one:many)

payment_methods
  ↑
  ├─ orders (one:many)
  └─ transactions (one:many)

orders
  ↑
  ├─ order_items (one:many)
  └─ transactions (one:many)
```

---

## Key Features

### Security
- ✅ Passwords hashed with bcrypt
- ✅ Foreign key constraints for referential integrity
- ✅ Audit logging for compliance
- ✅ Status flags for soft deletes
- ✅ Unique constraints on sensitive fields

### Performance
- ✅ Indexes on frequently queried fields
- ✅ Foreign key indexes
- ✅ UUID/code fields for fast lookups
- ✅ InnoDB for transaction support

### Data Integrity
- ✅ Foreign key relationships
- ✅ ON DELETE CASCADE for order items
- ✅ ON DELETE SET NULL for optional relationships
- ✅ Timestamp tracking (created_at, updated_at)

### Flexibility
- ✅ Support for guest orders (NULL cust_id)
- ✅ Multiple payment methods
- ✅ Inventory management
- ✅ Stock adjustments
- ✅ Transaction history

---

## Common Queries

### Get Sales Report
```sql
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(*) as order_count,
    SUM(o.total_amount) as total_sales,
    SUM(o.discount_amount) as total_discount,
    AVG(o.total_amount) as avg_order_value
FROM orders o
WHERE o.order_status = 'completed'
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;
```

### Get Popular Products
```sql
SELECT 
    p.prd_id,
    p.name,
    SUM(oi.item_qty) as total_sold,
    SUM(oi.item_total) as total_revenue
FROM products p
JOIN order_items oi ON p.prd_id = oi.prd_id
GROUP BY p.prd_id
ORDER BY total_sold DESC
LIMIT 10;
```

### Get Low Stock Products
```sql
SELECT 
    prd_id,
    name,
    qty,
    price
FROM products
WHERE qty < 10 AND status = 1
ORDER BY qty ASC;
```

### Get Customer Order History
```sql
SELECT 
    o.order_id,
    o.invoice_number,
    o.created_at,
    o.total_amount,
    o.order_status,
    p.name,
    oi.item_qty
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.prd_id = p.prd_id
WHERE o.cust_id = ?
ORDER BY o.created_at DESC;
```

---

## Installation & Setup

### Step 1: Create Database
```bash
mysql -u root -p < database-schema.sql
```

### Step 2: Verify Database
```bash
mysql -u root -p -D pos_system -e "SHOW TABLES;"
```

### Step 3: Check Node.js Connection
Ensure your backend `.env` has correct MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pos_system
```

### Step 4: Start Backend
```bash
cd backend
npm install
npm start
```

---

## Maintenance & Backups

### Backup Database
```bash
mysqldump -u root -p pos_system > backup_pos_system.sql
```

### Restore from Backup
```bash
mysql -u root -p pos_system < backup_pos_system.sql
```

### Check Table Status
```sql
SELECT table_name, table_rows, data_length/1024/1024 as size_mb 
FROM information_schema.tables 
WHERE table_schema = 'pos_system'
ORDER BY data_length DESC;
```

---

**Last Updated:** May 17, 2026  
**Version:** 1.0  
**Status:** Production Ready
