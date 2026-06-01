const db = require('../config/db');
const otpStore = require('../utils/otpStore');
const bcrypt = require('bcrypt');
const { errorResponse } = require('../utils/errorHandler');

// ================= GET ALL USERS =================
const GetUser = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM users");

        return res.json({
            success: true,
            data: rows
        });

    } catch (err) {
        console.error('Get users error:', err);
        return res.status(500).json(
            errorResponse('Failed to retrieve users', 500)
        );
    }
};

// ================= GET ONE USER =================
const GetOne = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json(
                errorResponse('User ID is required', 400)
            );
        }

        const [rows] = await db.query(
            "SELECT * FROM users WHERE id = ?", [id]
        );

        if (rows.length === 0) {
            return res.status(404).json(
                errorResponse('User not found', 404)
            );
        }

        return res.json({
            success: true,
            data: rows[0]
        });

    } catch (err) {
        console.error('Get user error:', err);
        return res.status(500).json(
            errorResponse('Failed to retrieve user', 500)
        );
    }
};

// ================= CREATE USER =================
const Create = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json(
                errorResponse('Name, email, and password are required', 400)
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json(
                errorResponse('Invalid email format', 400)
            );
        }

        // Password strength check
        if (password.length < 6) {
            return res.status(400).json(
                errorResponse('Password must be at least 6 characters', 400)
            );
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (name,email,password) VALUES (?,?,?)";
        const [result] = await db.query(sql, [name, email, hash]);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            userId: result.insertId
        });

    } catch (err) {
        console.error('Create user error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json(
                errorResponse('Email already registered', 409)
            );
        }
        return res.status(500).json(
            errorResponse('Failed to create user', 500)
        );
    }
};

// ================= UPDATE USER =================
const Update = async (req, res) => {
    try {
        const { id } = req.params;  // Get id from URL parameter
        const { name, email } = req.body;  // Get name, email from request body

        if (!id) {
            return res.status(400).json(
                errorResponse('User ID is required', 400)
            );
        }

        if (!name && !email) {
            return res.status(400).json(
                errorResponse('At least one field (name or email) is required', 400)
            );
        }

        const sql = "UPDATE users SET name=?, email=? WHERE id=?";
        const [result] = await db.query(sql, [name, email, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json(
                errorResponse('User not found', 404)
            );
        }

        return res.json({
            success: true,
            message: "User updated successfully"
        });

    } catch (err) {
        console.error('Update user error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json(
                errorResponse('Email already in use', 409)
            );
        }
        return res.status(500).json(
            errorResponse('Failed to update user', 500)
        );
    }
};

// ================= DELETE USER =================
const Delete = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json(
                errorResponse('User ID is required', 400)
            );
        }

        const [result] = await db.query(
            "DELETE FROM users WHERE id=?", [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(
                errorResponse('User not found', 404)
            );
        }

        return res.json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (err) {
        console.error('Delete user error:', err);
        return res.status(500).json(
            errorResponse('Failed to delete user', 500)
        );
    }
};

// ================= LOGIN =================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json(
                errorResponse('Email and password are required', 400)
            );
        }

        const [rows] = await db.query(
            "SELECT * FROM users WHERE email=?", [email]
        );

        if (rows.length === 0) {
            return res.status(401).json(
                errorResponse('Invalid credentials', 401)
            );
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json(
                errorResponse('Invalid credentials', 401)
            );
        }

        return res.json({
            success: true,
            message: "Login successful",
            user: user
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json(
            errorResponse('Login failed', 500)
        );
    }
};

// ================= SEND OTP =================
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json(
                errorResponse('Email is required', 400)
            );
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        // Save OTP in memory
        otpStore[email] = {
            otp: otp,
            expire: Date.now() + 5 * 60 * 1000 // 5 minutes
        };

        console.log("OTP:", otp); // simulate sending

        return res.json({
            success: true,
            message: "OTP sent to email (check console for testing)"
        });

    } catch (err) {
        console.error('Send OTP error:', err);
        return res.status(500).json(
            errorResponse('Failed to send OTP', 500)
        );
    }
};

// ================= VERIFY OTP =================
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json(
                errorResponse('Email and OTP are required', 400)
            );
        }

        const data = otpStore[email];

        if (!data) {
            return res.status(400).json(
                errorResponse('OTP not found. Please request a new OTP', 400)
            );
        }

        if (Date.now() > data.expire) {
            delete otpStore[email];
            return res.status(400).json(
                errorResponse('OTP expired. Please request a new OTP', 400)
            );
        }

        if (parseInt(otp) !== data.otp) {
            return res.status(400).json(
                errorResponse('Invalid OTP', 400)
            );
        }

        delete otpStore[email]; // Clear OTP after verification
        return res.json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (err) {
        console.error('Verify OTP error:', err);
        return res.status(500).json(
            errorResponse('OTP verification failed', 500)
        );
    }
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json(
                errorResponse('Email and new password are required', 400)
            );
        }

        if (newPassword.length < 6) {
            return res.status(400).json(
                errorResponse('Password must be at least 6 characters', 400)
            );
        }

        const hash = await bcrypt.hash(newPassword, 10);

        const [result] = await db.query(
            "UPDATE users SET password=? WHERE email=?",
            [hash, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(
                errorResponse('User not found', 404)
            );
        }

        return res.json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json(
            errorResponse('Failed to reset password', 500)
        );
    }
};

module.exports = {
    GetUser,
    GetOne,
    Create,
    Update,
    Delete,
    login,
    sendOTP,
    verifyOtp,
    resetPassword
};