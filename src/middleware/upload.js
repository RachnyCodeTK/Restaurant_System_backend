const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ================= UPLOADS DIRECTORY =================
const uploadsDir = 'uploads';

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ================= STORAGE CONFIG =================
const storage = multer.diskStorage({

    // Folder to save uploaded files
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },

    // Rename file to avoid duplicate names
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Allow only image files
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    }
});

// ✅ Export both upload instance and single middleware
module.exports = upload;
module.exports.uploadPhoto = upload.single('photo');