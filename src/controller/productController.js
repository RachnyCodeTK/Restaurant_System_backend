const db = require('../config/db');
const { AppError, errorResponse } = require('../utils/errorHandler');

// ================= GET ALL PRODUCTS =================
const get = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM products ORDER BY prd_id DESC");

        return res.json({
            success: true,
            data: rows
        });

    } catch (err) {
        console.error('Get products error:', err);
        return res.status(500).json(
            errorResponse('Failed to retrieve products', 500)
        );
    }
};

// ================= SEARCH PRODUCT =================
// /api/product/search?q=...
const search = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === '') {
            return res.status(400).json(
                errorResponse('Search query is required', 400)
            );
        }

        const sql = `
            SELECT * FROM products
            WHERE 
                prd_id LIKE ? OR
                prd_code LIKE ? OR
                name LIKE ?
            ORDER BY prd_id DESC
        `;

        const keyword = `%${q}%`;

        const [rows] = await db.query(sql, [keyword, keyword, keyword]);

        return res.json({
            success: true,
            data: rows
        });

    } catch (err) {
        console.error('Search products error:', err);
        return res.status(500).json(
            errorResponse('Failed to search products', 500)
        );
    }
};


// ================= CREATE PRODUCT =================
const create = async (req, res) => {
    try {
        const { prd_code, name, price, qty, photo, brand_id, cat_id } = req.body;

        // Validation
        if (!prd_code || !name || !price || !qty) {
            return res.status(400).json(
                errorResponse('Product code, name, price and quantity are required', 400)
            );
        }

        // Validate price and qty are numbers
        if (isNaN(price) || isNaN(qty)) {
            return res.status(400).json(
                errorResponse('Price and quantity must be numbers', 400)
            );
        }

        if (price <= 0 || qty < 0) {
            return res.status(400).json(
                errorResponse('Price must be greater than 0 and quantity cannot be negative', 400)
            );
        }

        // Handle image: either from uploaded file or from URL string
        let photoValue = null;
        if (req.file) {
            // File uploaded via multipart form
            photoValue = req.file.filename;
        } else if (photo && photo.trim() !== '') {
            // URL provided as string
            photoValue = photo;
        }

        const sql = "INSERT INTO products (prd_code, name, price, qty, photo, brand_id, cat_id) VALUES (?,?,?,?,?,?,?)";
        const [result] = await db.query(sql, [prd_code, name, price, qty, photoValue, brand_id || null, cat_id || null]);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            productId: result.insertId
        });

    } catch (err) {
        console.error('Create product error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json(
                errorResponse('Product name already exists', 409)
            );
        }
        return res.status(500).json(
            errorResponse('Failed to create product', 500)
        );
    }
};

//edit product details
const getById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM products WHERE prd_id=?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            data: rows[0]
        });

    } catch (err) {
        console.error('Get product by ID error:', err);
        return res.status(500).json({
            success: false,
            message: "Error fetching product"
        });
    }
};

// ================= UPDATE PRODUCT =================
const update = async (req, res) => {
    try {
        const { prd_id, name, price, qty, photo, brand_id, cat_id } = req.body;

        // Validate product ID
        if (!prd_id) {
            return res.status(400).json(
                errorResponse('Product ID is required', 400)
            );
        }

        // Validate required fields
        if (!name || !price || qty === undefined) {
            return res.status(400).json(
                errorResponse('Product name, price, and quantity are required', 400)
            );
        }

        // Check product exists
        const [check] = await db.query(
            "SELECT * FROM products WHERE prd_id=?", [prd_id]
        );

        if (check.length === 0) {
            return res.status(404).json(
                errorResponse('Product not found', 404)
            );
        }

        // Validate price and qty are numbers
        if (isNaN(price) || price <= 0) {
            return res.status(400).json(
                errorResponse('Price must be a valid positive number', 400)
            );
        }

        if (isNaN(qty) || qty < 0) {
            return res.status(400).json(
                errorResponse('Quantity must be a valid non-negative number', 400)
            );
        }

        // Handle image: either from uploaded file, URL string, or keep existing
        let photoValue = check[0].photo;

        if (req.file) {
            // File uploaded via multipart form
            photoValue = req.file.filename;
        } else if (photo && photo.trim() !== '') {
            // URL or filename provided as string
            photoValue = photo;
        }

        const sql = `
            UPDATE products 
            SET name=?, price=?, qty=?, brand_id=?, cat_id=?, photo=? 
            WHERE prd_id=?
        `;

        await db.query(sql, [name, price, qty, brand_id || null, cat_id || null, photoValue, prd_id]);

        return res.json({
            success: true,
            message: "Product updated successfully"
        });

    } catch (err) {
        console.error('Update product error:', err);
        return res.status(500).json(
            errorResponse('Failed to update product', 500)
        );
    }
};

// ================= DELETE PRODUCT =================
const deleteProduct = async (req, res) => {
    try {
        const prd_id = req.params.prd_id;

        if (!prd_id) {
            return res.status(400).json(
                errorResponse('Product ID is required', 400) 
            );
        }

        const [result] = await db.query(
            "DELETE FROM products WHERE prd_id=?", [prd_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(
                errorResponse('Product not found', 404)
            );
        }

        return res.json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (err) {
        console.error('Delete product error:', err);
        return res.status(500).json(
            errorResponse('Failed to delete product', 500)
        );
    }


};

// ================= ADJUSTMENT PRODUCT =================
// /api/product/adjustment
// {
//     "prd_id": 1,
//     "qty": 10
// }
// const adjustment = async (req, res) => {
//     try {
//         let { prd_id, qty, prd_code, name } = req.body;

//         // =========================
//         // VALIDATE INPUT
//         // =========================
//         if (qty === undefined || qty === null) {
//             return res.status(400).json(
//                 errorResponse("Quantity is required", 400)
//             );
//         }

//         // Convert qty to number
//         qty = Number(qty);

//         if (isNaN(qty)) {
//             return res.status(400).json(
//                 errorResponse("Quantity must be a valid number", 400)
//             );
//         }

//         // =========================
//         // FIND PRODUCT
//         // =========================
//         let product = null;

//         // Find by Product ID
//         if (prd_id) {
//             const [rows] = await db.query(
//                 "SELECT * FROM products WHERE prd_id = ?",
//                 [prd_id]
//             );

//             product = rows[0];
//         }

//         // Find by Product Code
//         else if (prd_code) {
//             const [rows] = await db.query(
//                 "SELECT * FROM products WHERE prd_code = ?",
//                 [prd_code]
//             );

//             product = rows[0];
//         }

//         // Find by Product Name
//         else if (name) {
//             const [rows] = await db.query(
//                 "SELECT * FROM products WHERE name = ?",
//                 [name]
//             );

//             product = rows[0];
//         }

//         // No search condition
//         else {
//             return res.status(400).json(
//                 errorResponse(
//                     "Please provide prd_id, prd_code, or name",
//                     400
//                 )
//             );
//         }

//         // =========================
//         // CHECK PRODUCT EXIST
//         // =========================
//         if (!product) {
//             return res.status(404).json(
//                 errorResponse("Product not found", 404)
//             );
//         }

//         // Prevent reducing stock below zero
//         if (product.qty + qty < 0) {
//             return res.status(400).json(
//                 errorResponse("Adjusted quantity would make stock negative", 400)
//             );
//         }

//         // =========================
//         // UPDATE PRODUCT QTY
//         // =========================
//         await db.query(
//             `
//             UPDATE products
//             SET qty = qty + ?
//             WHERE prd_id = ?
//             `,
//             [qty, product.prd_id]
//         );

//         // =========================
//         // SUCCESS RESPONSE
//         // =========================
//         return res.status(200).json({
//             success: true,
//             message: "Product quantity updated successfully",
//             data: {
//                 prd_id: product.prd_id,
//                 prd_code: product.prd_code,
//                 name: product.name,
//                 adjusted_qty: qty
//             }
//         });

//     } catch (err) {
//         console.error("Adjustment product error:", err);

//         return res.status(500).json(
//             errorResponse("Failed to update product quantity", 500)
//         );
//     }
// };

// ================= ADJUSTMENT PRODUCT =================
// /api/product/adjustment
// {
//     "prd_id": 1,
//     "qty": 10
// }
const adjustment = async (req, res) => {
    try {
        let { prd_id, qty, prd_code, name } = req.body;

        // =========================
        // VALIDATE INPUT
        // =========================
        if (qty === undefined || qty === null) {
            return res.status(400).json(
                errorResponse("Quantity is required", 400)
            );
        }

        // Convert qty to number
        qty = Number(qty);

        if (isNaN(qty)) {
            return res.status(400).json(
                errorResponse("Quantity must be a valid number", 400)
            );
        }

        // =========================
        // FIND PRODUCT
        // =========================
        let product = null;

        // Find by Product ID
        if (prd_id) {
            const [rows] = await db.query(
                "SELECT * FROM products WHERE prd_id = ?",
                [prd_id]
            );

            product = rows[0];
        }

        // Find by Product Code
        else if (prd_code) {
            const [rows] = await db.query(
                "SELECT * FROM products WHERE prd_code = ?",
                [prd_code]
            );

            product = rows[0];
        }

        // Find by Product Name
        else if (name) {
            const [rows] = await db.query(
                "SELECT * FROM products WHERE name = ?",
                [name]
            );

            product = rows[0];
        }

        // No search condition
        else {
            return res.status(400).json(
                errorResponse(
                    "Please provide prd_id, prd_code, or name",
                    400
                )
            );
        }

        // =========================
        // CHECK PRODUCT EXIST
        // =========================
        if (!product) {
            return res.status(404).json(
                errorResponse("Product not found", 404)
            );
        }

        // Prevent reducing stock below zero
        if (product.qty + qty < 0) {
            return res.status(400).json(
                errorResponse("Adjusted quantity would make stock negative", 400)
            );
        }

        // =========================
        // UPDATE PRODUCT QTY
        // =========================
        await db.query(
            `
            UPDATE products
            SET qty = qty + ?
            WHERE prd_id = ?
            `,
            [qty, product.prd_id]
        );

        // =========================
        // SUCCESS RESPONSE
        // =========================
        return res.status(200).json({
            success: true,
            message: "Product quantity updated successfully",
            data: {
                prd_id: product.prd_id,
                prd_code: product.prd_code,
                name: product.name,
                adjusted_qty: qty
            }
        });

    } catch (err) {
        console.error("Adjustment product error:", err);

        return res.status(500).json(
            errorResponse("Failed to update product quantity", 500)
        );
    }
};


module.exports = {
    get,
    search,
    create,
    getById,
    update,
    deleteProduct,
    adjustment
};