const db = require('../config/db');
const { errorResponse } = require('../utils/errorHandler');

// ================= GET ALL CATEGORIES =================
const get = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM categories ORDER BY cat_id DESC");

        return res.json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (err) {
        console.error('Get categories error:', err);
        return res.status(500).json(
            errorResponse('Failed to retrieve categories', 500)
        );
    }
};

// ================= SEARCH CATEGORY =================
// Example: /api/category/search?name=beverages
const search = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name || name.trim() === '') {
            return res.status(400).json(
                errorResponse('Search name is required', 400)
            );
        }

        const sql = "SELECT * FROM categories WHERE cat_name LIKE ?";
        const [rows] = await db.query(sql, [`%${name}%`]);

        return res.json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (err) {
        console.error('Search categories error:', err);
        return res.status(500).json(
            errorResponse('Failed to search categories', 500)
        );
    }
};

// ================= CREATE CATEGORY =================
const create = async (req, res) => {
    try {
        const { cat_name, description, status } = req.body;

        // Validation
        if (!cat_name || cat_name.trim() === '') {
            return res.status(400).json(
                errorResponse('Category name is required', 400)
            );
        }

        // Get uploaded image file name
        const image = req.file ? req.file.filename : null;
        const catStatus = status !== undefined ? status : 1; // Default to active

        const sql = "INSERT INTO categories (cat_name, description, image, status) VALUES (?,?,?,?)";
        const [result] = await db.query(sql, [cat_name, description || null, image, catStatus]);

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: {
                cat_id: result.insertId,
                cat_name: cat_name,
                description: description || null,
                image: image,
                status: catStatus
            }
        });

    } catch (err) {
        console.error('Create category error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json(
                errorResponse('Category name already exists', 409)
            );
        }
        return res.status(500).json(
            errorResponse('Failed to create category', 500)
        );
    }
};

// ================= UPDATE CATEGORY =================
const update = async (req, res) => {
    try {
        const cat_id = req.params.code || req.body.cat_id; // Support both URL param and body
        const { cat_name, description, status } = req.body;

        // Validate category ID
        if (!cat_id) {
            return res.status(400).json(
                errorResponse('Category ID is required', 400)
            );
        }

        // Check category exists
        const [check] = await db.query(
            "SELECT * FROM categories WHERE cat_id=?", [cat_id]
        );

        if (check.length === 0) {
            return res.status(404).json(
                errorResponse('Category not found', 404)
            );
        }

        let image = check[0].image;

        // If new image uploaded
        if (req.file) {
            image = req.file.filename;
        }

        const sql = `
            UPDATE categories 
            SET cat_name=?, description=?, image=?, status=? 
            WHERE cat_id=?
        `;

        await db.query(sql, [
            cat_name || check[0].cat_name,
            description !== undefined ? description : check[0].description,
            image,
            status !== undefined ? status : check[0].status,
            cat_id
        ]);

        return res.json({
            success: true,
            message: "Category updated successfully",
            data: {
                cat_id: cat_id,
                cat_name: cat_name || check[0].cat_name,
                description: description !== undefined ? description : check[0].description,
                image: image,
                status: status !== undefined ? status : check[0].status
            }
        });

    } catch (err) {
        console.error('Update category error:', err);
        return res.status(500).json(
            errorResponse('Failed to update category', 500)
        );
    }
};

// ================= DELETE CATEGORY =================
const deleteCategory = async (req, res) => {
    try {
        const cat_id = req.params.code; // Using code as cat_id in URL

        if (!cat_id) {
            return res.status(400).json(
                errorResponse('Category ID is required', 400)
            );
        }

        const [result] = await db.query(
            "DELETE FROM categories WHERE cat_id=?", [cat_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(
                errorResponse('Category not found', 404)
            );
        }

        return res.json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (err) {
        console.error('Delete category error:', err);
        return res.status(500).json(
            errorResponse('Failed to delete category', 500)
        );
    }
};

module.exports = {
    get,
    search,
    create,
    update,
    deleteCategory
};
