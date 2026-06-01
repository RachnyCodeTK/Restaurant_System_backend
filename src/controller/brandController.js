const db = require('../config/db');
const { errorResponse } = require('../utils/errorHandler');

// ================= GET ALL BRANDS =================
const get = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM brands ORDER BY brand_id DESC");

        return res.json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (err) {
        console.error('Get brands error:', err);
        return res.status(500).json(
            errorResponse('Failed to retrieve brands', 500)
        );
    }
};

// ================= SEARCH BRAND =================
// Example: /api/brand/search?name=coca
const search = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name || name.trim() === '') {
            return res.status(400).json(
                errorResponse('Search name is required', 400)
            );
        }

        const sql = "SELECT * FROM brands WHERE brand_name LIKE ?";
        const [rows] = await db.query(sql, [`%${name}%`]);

        return res.json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (err) {
        console.error('Search brands error:', err);
        return res.status(500).json(
            errorResponse('Failed to search brands', 500)
        );
    }
};

// CREATE BRAND 
const create = async (req, res) => {
    try {
        const { brand_name, description, status } = req.body;

        // Validation
        if (!brand_name || brand_name.trim() === '') {
            return res.status(400).json(
                errorResponse('Brand name is required', 400)
            );
        }

        const brandStatus = status !== undefined ? status : 1; // Default to active

        const sql = "INSERT INTO brands (brand_name, description, status) VALUES (?,?,?)";
        const [result] = await db.query(sql, [brand_name, description || null, brandStatus]);

        return res.status(201).json({
            success: true,
            message: "Brand created successfully",
            data: {
                brand_id: result.insertId,
                brand_name: brand_name,
                description: description || null,
                status: brandStatus
            }
        });

    } catch (err) {
        console.error('Create brand error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json(
                errorResponse('Brand name already exists', 409)
            );
        }
        return res.status(500).json(
            errorResponse('Failed to create brand', 500)
        );
    }
};

// ================= UPDATE BRAND =================
const update = async (req, res) => {
    try {
        const brand_id = req.params.code; // Using code as brand_id in URL
        const { brand_name, description, status } = req.body;

        // Validate brand ID
        if (!brand_id) {
            return res.status(400).json(
                errorResponse('Brand ID is required', 400)
            );
        }

        // Check brand exists
        const [check] = await db.query(
            "SELECT * FROM brands WHERE brand_id=?", [brand_id]
        );

        if (check.length === 0) {
            return res.status(404).json(
                errorResponse('Brand not found', 404)
            );
        }

        const sql = `
            UPDATE brands 
            SET brand_name=?, description=?, status=? 
            WHERE brand_id=?
        `;

        await db.query(sql, [
            brand_name || check[0].brand_name,
            description !== undefined ? description : check[0].description,
            status !== undefined ? status : check[0].status,
            brand_id
        ]);

        return res.json({
            success: true,
            message: "Brand updated successfully",
            data: {
                brand_id: brand_id,
                brand_name: brand_name || check[0].brand_name,
                description: description !== undefined ? description : check[0].description,
                status: status !== undefined ? status : check[0].status
            }
        });

    } catch (err) {
        console.error('Update brand error:', err);
        return res.status(500).json(
            errorResponse('Failed to update brand', 500)
        );
    }
};

// ================= DELETE BRAND =================
const deleteBrand = async (req, res) => {
    try {
        const brand_id = req.params.code; // Using code as brand_id in URL

        if (!brand_id) {
            return res.status(400).json(
                errorResponse('Brand ID is required', 400)
            );
        }

        const [result] = await db.query(
            "DELETE FROM brands WHERE brand_id=?", [brand_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(
                errorResponse('Brand not found', 404)
            );
        }

        return res.json({
            success: true,
            message: "Brand deleted successfully"
        });

    } catch (err) {
        console.error('Delete brand error:', err);
        return res.status(500).json(
            errorResponse('Failed to delete brand', 500)
        );
    }
};

module.exports = {
    get,
    search,
    create,
    update,
    deleteBrand
};
