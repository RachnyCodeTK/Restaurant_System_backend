# Back-End Setup & API Documentation

## Project Structure
```
back-end/
├── src/
│   ├── app.js                   # Main Express app with routes
│   ├── auth/                    # Authentication logic
│   ├── config/
│   │   └── db.js               # Database configuration
│   ├── controller/              # Route handlers
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── brandController.js
│   │   ├── customerController.js
│   │   ├── customerOrderController.js
│   │   └── paymentMethodController.js
│   ├── middleware/
│   │   ├── upload.js           # File upload handling
│   │   └── validateRequest.js  # Request validation
│   ├── models/                  # Database models
│   ├── routes/                  # Route definitions
│   │   ├── userRoute.js
│   │   ├── productRoute.js
│   │   ├── categoryRoute.js
│   │   ├── brandRoute.js
│   │   ├── customerRoute.js
│   │   └── paymentMethodRoute.js
│   ├── service/                 # Business logic
│   ├── utils/
│   │   ├── errorHandler.js     # Global error handling
│   │   └── otpStore.js         # OTP management
│   └── data/                    # Data files
├── index.js                     # Server entry point
├── package.json
├── payment_methods.sql          # Database seed file
└── uploads/                     # File upload directory
```

## Installation

### 1. Install Dependencies
```bash
cd back-end
npm install
```

This installs:
- Express 5.2.1
- MySQL2 3.20.0
- Multer 2.1.1 (file uploads)
- BCrypt 6.0.0 (password hashing)
- CORS 2.8.6 (cross-origin requests)
- dotenv 17.3.1 (environment variables)

### 2. Configure Environment Variables
Create a `.env` file in the `back-end` directory:
```
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_db

# Business Logic
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

### 3. Database Setup
```bash
# Create database
mysql -u root -p

# In MySQL console:
CREATE DATABASE restaurant_db;
USE restaurant_db;

# Load schema and seed data
SOURCE payment_methods.sql;
```

### 4. Start Development Server
```bash
npm run dev
```

Server will run on: `http://localhost:3000`

---

## API Endpoints Overview

### Base URL
```
http://localhost:3000/api
```

### User Management (Staff/Admin)
```
GET    /user              - Get all users
GET    /user/:id          - Get user by ID
POST   /user              - Create new user
PUT    /user/:id          - Update user
DELETE /user/:id          - Delete user
POST   /user/login        - Login with email & password
POST   /user/sendOTP      - Send OTP to email
POST   /user/verifyOTP    - Verify OTP code
POST   /user/resetPassword - Reset password with email
```

### Products
```
GET    /product                - Get all products
GET    /product/search         - Search products
POST   /product                - Create product (multipart)
PUT    /product                - Update product (multipart)
DELETE /product/:prd_id        - Delete product
```

### Categories
```
GET    /category               - Get all categories
GET    /category/search        - Search categories
POST   /category               - Create category (multipart)
PUT    /category/:code         - Update category
DELETE /category/:code         - Delete category
```

### Brands
```
GET    /brand                  - Get all brands
GET    /brand/search           - Search brands
POST   /brand                  - Create brand (multipart)
PUT    /brand/:code            - Update brand
DELETE /brand/:code            - Delete brand
```

### Payment Methods
```
GET    /payment-method         - Get all payment methods
GET    /payment-method/:code   - Get payment method
POST   /payment-method         - Create payment method
PUT    /payment-method/:code   - Update payment method
DELETE /payment-method/:code   - Delete payment method
```

### Customers (Public & Protected)
```
POST   /customer/register      - Register new customer
POST   /customer/login         - Customer login
GET    /customer               - Get all customers (admin)
GET    /customer/search        - Search customers
GET    /customer/:id           - Get customer by ID
GET    /customer/profile       - Get current customer profile
PUT    /customer               - Update customer
PUT    /customer/change-password - Change password
DELETE /customer/:id           - Delete customer
```

### Customer Orders (Checkout & Tracking)
```
POST   /customer/order         - Place new order
GET    /customer/orders        - Get customer's orders
GET    /customer/order/:order_id - Get order details
GET    /customer/orders/track  - Track order by email
DELETE /customer/order/:order_id - Cancel order
```

---

## Request/Response Examples

### Login Request
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Create Product (with image)
```bash
curl -X POST http://localhost:3000/api/product \
  -F "name=Margherita Pizza" \
  -F "description=Fresh mozzarella and basil" \
  -F "price=12.99" \
  -F "photo=@/path/to/image.jpg"
```

### Place Order
```bash
curl -X POST http://localhost:3000/api/customer/order \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St",
      "phone": "555-1234"
    },
    "items": [
      {"id": 1, "name": "Pizza", "price": 12.99, "quantity": 2}
    ],
    "total": 25.98,
    "paymentMethod": "credit-card"
  }'
```

---

## Error Handling

All endpoints return standardized error responses:

### Success Response (200 OK)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "status": 400
}
```

### Common Status Codes
- `200` OK - Request successful
- `201` Created - Resource created
- `400` Bad Request - Invalid input
- `401` Unauthorized - Authentication required
- `403` Forbidden - Permission denied
- `404` Not Found - Resource not found
- `500` Server Error - Server error

---

## Middleware

### File Upload (Multer)
Handles image uploads for products, categories, and brands:
- Destination: `uploads/`
- Field name: `photo`, `image`, `logo`
- Max size: 5MB (configurable in `middleware/upload.js`)

### Request Validation
Validates incoming requests for required fields and data types.

### Error Handler
Global error handling middleware catches and formats all errors.

---

## Database Models

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  role ENUM('admin', 'staff'),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  categoryId INT,
  brandId INT,
  photo VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Customers Table
```sql
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customerId INT,
  total DECIMAL(10, 2),
  status ENUM('pending', 'confirmed', 'cancelled'),
  paymentMethod VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Key Features

### Authentication
- Email/password login for staff
- Email/password login for customers
- OTP-based password reset
- Password hashing with BCrypt

### File Uploads
- Product images
- Category images
- Brand logos
- Automatic file organization

### Shopping Cart & Checkout
- Add items to cart on frontend
- Place orders with customer info
- Support for guest checkout (email-based)
- Multiple payment methods

### Search & Filtering
- Search across products, categories, customers
- Query parameters for filtering

---

## Common Tasks

### 1. Add a New Route
1. Create controller in `src/controller/newController.js`
2. Create route file `src/routes/newRoute.js`
3. Add to `src/app.js`:
```javascript
const newRoute = require('./routes/newRoute');
newRoute(app);
```

### 2. Handle File Upload
```javascript
const upload = require('../middleware/upload');

// In route:
app.post('/api/endpoint', upload.single('photo'), controller.create);
```

### 3. Add Request Validation
```javascript
const { validateRequest } = require('../middleware/validateRequest');

// In controller:
const errors = validateRequest(req.body, ['email', 'password']);
if (errors.length > 0) {
  return res.status(400).json({ errors });
}
```

---

## Security Notes

1. **Enable CORS**: Configure `CORS_ORIGIN` in `.env`
2. **Hash Passwords**: Always hash before storing
3. **Validate Input**: Validate all user inputs
4. **Error Messages**: Don't expose sensitive error details
5. **Use HTTPS in Production**: For secured communication
6. **Rate Limiting**: Consider adding rate limiting middleware
7. **SQL Injection**: Use parameterized queries

---

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### Port Already in Use
```bash
# Change port in .env or find process using port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux
```

### File Upload Not Working
- Check `uploads/` directory exists
- Verify write permissions
- Check file size limits in `middleware/upload.js`

### CORS Errors
```javascript
// Add to app.js
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
```

---

## Production Deployment

### Environment Setup
```bash
NODE_ENV=production
PORT=3000
# Use production database
# Use long JWT secret
```

### Build Process
```bash
npm install --production
npm start
```

### Considerations
- Use process manager (PM2, Forever)
- Set up database backups
- Configure logging
- Monitor performance
- Set up error tracking

---

## Useful Resources

- Express.js: https://expressjs.com
- MySQL2: https://github.com/mysqljs/mysql
- Multer: https://github.com/expressjs/multer
- BCrypt: https://github.com/kelektiv/node.bcrypt.js
