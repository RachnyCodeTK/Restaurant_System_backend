const db = require('../config/db');
const { errorResponse } = require('../utils/errorHandler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ================= CUSTOMER REGISTRATION =================
const register = async (req, res) => {
    try {
        const { cust_name, cust_email, cust_phone, cust_password, cust_address } = req.body;

        // Validation
        if (!cust_name || !cust_email || !cust_phone || !cust_password) {
            return res.status(400).json(
                errorResponse('Name, email, phone, and password are required', 400)
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cust_email)) {
            return res.status(400).json(
                errorResponse('Invalid email format', 400)
            );
        }

        // Password strength check
        if (cust_password.length < 6) {
            return res.status(400).json(
                errorResponse('Password must be at least 6 characters', 400)
            );
        }

        // Check if email already exists
        const [existing] = await db.query(
            "SELECT cust_id FROM customers WHERE cust_email = ?", 
            [cust_email]
        );

        if (existing.length > 0) {
            return res.status(409).json(
                errorResponse('Email already registered', 409)
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(cust_password, 10);

        const sql = `
            INSERT INTO customers (cust_name, cust_email, cust_phone, cust_password, cust_address, cust_status)
            VALUES (?, ?, ?, ?, ?, 1)
        `;

        const [result] = await db.query(sql, [
            cust_name,
            cust_email,
            cust_phone,
            hashedPassword,
            cust_address || null
        ]);

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            data: {
                cust_id: result.insertId,
                cust_name: cust_name,
                cust_email: cust_email,
                cust_phone: cust_phone
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json(
            errorResponse('Registration failed', 500)
        );
    }
};

// ================= CUSTOMER LOGIN =================

// const login = async (req, res) => {
//     try {
//         const { cust_email, cust_password } = req.body;

//         if (!cust_email || !cust_password) {
//             return res.status(400).json(
//                 errorResponse('Email and password are required', 400)
//             );
//         }

//         const [rows] = await db.query(
//             "SELECT * FROM customers WHERE cust_email = ?",
//             [cust_email]
//         );

//         if (rows.length === 0) {
//             return res.status(401).json(
//                 errorResponse('Invalid credentials', 401)
//             );
//         }

//         const customer = rows[0];

//         // Check password
//         const isMatch = await bcrypt.compare(cust_password, customer.cust_password);

//         if (!isMatch) {
//             return res.status(401).json(
//                 errorResponse('Invalid credentials', 401)
//             );
//         }

//         // Don't send password in response
//         delete customer.cust_password;

//         return res.json({
//             success: true,
//             message: "Login successful",
//             data: customer
//         });

//     } catch (err) {
//         console.error('Login error:', err);
//         return res.status(500).json(
//             errorResponse('Login failed', 500)
//         );
//     }
// };


//test code

// ================= LOGIN =================
const loginCustomer = async (req, res) => {
    try {
        const { cust_email, cust_password } = req.body;

        if (!cust_email || !cust_password) { // Validate email and password presence
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // CHECK EMAIL
        const [rows] = await db.query(
            "SELECT * FROM customers WHERE cust_email = ?",
            [cust_email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email not found"
            });
        }

        const customer = rows[0];

        // CHECK PASSWORD
        const match = await bcrypt.compare(
            cust_password,
            customer.cust_password
        );

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Wrong password"
            });
        }

        // CREATE TOKEN
        const token = jwt.sign(
            {
                cust_id: customer.cust_id,
                role: "customer"
            },
            process.env.JWT_SECRET || "SECRET_KEY",
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login success",
            token,
            customer: {
                cust_id: customer.cust_id,
                cust_name: customer.cust_name,
                cust_email: customer.cust_email,
                cust_phone: customer.cust_phone
            }
        });

    } catch (error) {
        console.log("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
            
            
        });
    }
};

//Logout function (for token-based auth, this is usually handled on the client by deleting the token)
// ================= LOGOUT =================
const logoutCustomer = async (req, res) => {
    try {

        // If using JWT:
        // Logout is usually handled on frontend
        // by deleting token from localStorage/cookies

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {

        console.log("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during logout"
        });
    }
};

// ================= GET ALL CUSTOMERS =================
const get = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT cust_id, cust_name, cust_email, cust_phone, cust_address, cust_status, created_at FROM customers ORDER BY cust_id DESC"
        );

        return res.json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (err) {
        console.error('Get customers error:', err);
        return res.status(500).json(
            errorResponse('Failed to retrieve customers', 500)
        );
    }
};

// ================= GET ONE CUSTOMER =================
const getOne = async (req, res) => {
    try {
        const cust_id = req.params.id;

        if (!cust_id) {
            return res.status(400).json(
                errorResponse('Customer ID is required', 400)
            );
        }

        const [rows] = await db.query(
            "SELECT cust_id, cust_name, cust_email, cust_phone, cust_address, cust_status, created_at FROM customers WHERE cust_id = ?",
            [cust_id]
        );

        if (rows.length === 0) {
            return res.status(404).json(
                errorResponse('Customer not found', 404)
            );
        }

        return res.json({
            success: true,
            data: rows[0]
        });

    } catch (err) {
        console.error('Get customer error:', err);

        if (err && err.code === 'ECONNREFUSED') {
            return res.status(503).json(
                errorResponse('Database connection refused. Ensure MySQL is running and config is correct', 503)
            );
        }

        return res.status(500).json(
            errorResponse('Failed to retrieve customer', 500)
        );
    }
};

// ================= SEARCH CUSTOMERS =================
// const search = async (req, res) => {
//     try {
//         const { name, email, phone } = req.query; 

//         if (!name && !email && !phone) { 
//             return res.status(400).json(
//                 errorResponse('At least one search parameter is required (name, email, or phone)', 400)
//             );
//         }

//         let sql = "SELECT cust_id, cust_name, cust_email, cust_phone, cust_address, cust_status, created_at FROM customers WHERE 1=1";
//         let params = [];

//         if (name) {
//             sql += " AND cust_name LIKE ?";
//             params.push(`%${name}%`);
//         }
//         if (email) {
//             sql += " AND cust_email LIKE ?";
//             params.push(`%${email}%`);
//         }
//         if (phone) {
//             sql += " AND cust_phone LIKE ?";
//             params.push(`%${phone}%`);
//         }

//         const [rows] = await db.query(sql, params);

//         return res.json({
//             success: true,
//             data: rows,
//             count: rows.length
//         });

//     } catch (err) {
//         console.error('Search customers error:', err);
//         return res.status(500).json(
//             errorResponse('Failed to search customers', 500)
//         );
//     }
// };

// Search customer by name, email, or phone
const search = async (req, res) => {
    try {

        // Get query parameters from URL
        // Example:
        // /api/customer/search?name=John
        const {
            name,
            email,
            phone
        } = req.query;

        // Validate:
        // At least one search field must be provided
        if (
            (!name || name.trim() === "") &&
            (!email || email.trim() === "") &&
            (!phone || phone.trim() === "")
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one search parameter is required (name, email, or phone)",
                statusCode: 400
            });
        }

        // Base SQL query
        let sql = `
            SELECT
                cust_id,
                cust_name,
                cust_email,
                cust_phone,
                cust_address,
                cust_status,
                created_at
            FROM customers
            WHERE 1=1
        `;

        // Store query parameters safely
        let params = [];

        // Search by customer name
        if (name && name.trim() !== "") {
            sql += " AND cust_name LIKE ?";
            params.push(`%${name.trim()}%`);
        }

        // Search by customer email
        if (email && email.trim() !== "") {
            sql += " AND cust_email LIKE ?";
            params.push(`%${email.trim()}%`);
        }

        // Search by customer phone
        if (phone && phone.trim() !== "") {
            sql += " AND cust_phone LIKE ?";
            params.push(`%${phone.trim()}%`);
        }

        // Execute SQL query
        const [rows] = await db.query(sql, params);

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Search completed successfully",
            count: rows.length,
            data: rows
        });

    } catch (err) {

        // Show real error in terminal
        console.error("Search customers error:", err);

        // Return server error response
        return res.status(500).json({
            success: false,
            message: "Failed to search customers",
            statusCode: 500,
            error: err.message
        });
    }
};
// ================= UPDATE CUSTOMER =================
const update = async (req, res) => {
    try {
        const cust_id = req.body.cust_id;
        const { cust_name, cust_email, cust_phone, cust_address, cust_status } = req.body;

        if (!cust_id) {
            return res.status(400).json(
                errorResponse('Customer ID is required', 400)
            );
        }

        // Check customer exists
        const [check] = await db.query(
            "SELECT * FROM customers WHERE cust_id = ?",
            [cust_id]
        );

        if (check.length === 0) {
            return res.status(404).json(
                errorResponse('Customer not found', 404)
            );
        }

        const sql = `
            UPDATE customers 
            SET cust_name = ?, cust_email = ?, cust_phone = ?, cust_address = ?, cust_status = ?
            WHERE cust_id = ?
        `;

        await db.query(sql, [
            cust_name || check[0].cust_name,
            cust_email || check[0].cust_email,
            cust_phone || check[0].cust_phone,
            cust_address !== undefined ? cust_address : check[0].cust_address,
            cust_status !== undefined ? cust_status : check[0].cust_status,
            cust_id
        ]);

        return res.json({
            success: true,
            message: "Customer updated successfully"
        });

    } catch (err) {
        console.error('Update customer error:', err);
        return res.status(500).json(
            errorResponse('Failed to update customer', 500)
        );
    }
};

// ================= CHANGE PASSWORD =================
const changePassword = async (req, res) => {
    try {
        const { cust_id, oldPassword, newPassword } = req.body;

        if (!cust_id || !oldPassword || !newPassword) {
            return res.status(400).json(
                errorResponse('Customer ID, old password, and new password are required', 400)
            );
        }

        if (newPassword.length < 6) {
            return res.status(400).json(
                errorResponse('New password must be at least 6 characters', 400)
            );
        }

        // Get customer
        const [rows] = await db.query(
            "SELECT * FROM customers WHERE cust_id = ?",
            [cust_id]
        );

        if (rows.length === 0) {
            return res.status(404).json(
                errorResponse('Customer not found', 404)
            );
        }

        const customer = rows[0];

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, customer.cust_password);

        if (!isMatch) {
            return res.status(401).json(
                errorResponse('Old password is incorrect', 401)
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            "UPDATE customers SET cust_password = ? WHERE cust_id = ?",
            [hashedPassword, cust_id]
        );

        return res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (err) {
        console.error('Change password error:', err);
        return res.status(500).json(
            errorResponse('Failed to change password', 500)
        );
    }
};

// ================= GET CUSTOMER PROFILE =================

const getProfile = async (req, res) => {
    try {
        const cust_id = req.query.cust_id || req.body.cust_id;

        if (!cust_id) { // /api/customer/profile?cust_id=123 or { cust_id: 123 }
            return res.status(400).json({
                success: false,
                message: "Customer ID is required",
                statusCode: 400
            });
        }

        const [rows] = await db.query(
            `SELECT 
                cust_id,
                cust_name,
                cust_email,
                cust_phone,
                cust_address,
                cust_status,
                created_at
            FROM customers
            WHERE cust_id = ?`,
            [cust_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
                statusCode: 404
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (err) {
        console.error("Get profile error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve profile",
            statusCode: 500,
            error: err.message
        });
    }
};
// ================= DELETE CUSTOMER =================
const deleteCustomer = async (req, res) => {
    try {
        const cust_id = req.params.id;

        if (!cust_id) {
            return res.status(400).json(
                errorResponse('Customer ID is required', 400)
            );
        }

        const [result] = await db.query(
            "DELETE FROM customers WHERE cust_id = ?",
            [cust_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(
                errorResponse('Customer not found', 404)
            );
        }

        return res.json({
            success: true,
            message: "Customer deleted successfully"
        });

    } catch (err) {
        console.error('Delete customer error:', err);
        return res.status(500).json(
            errorResponse('Failed to delete customer', 500)
        );
    }
};

module.exports = {
    register,
    loginCustomer,
    logoutCustomer,
    get,
    getOne,
    search,
    update,
    changePassword,
    getProfile,
    deleteCustomer
};
