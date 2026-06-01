// ================= ERROR HANDLER UTILITY =================

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Error response formatter
const errorResponse = (message, statusCode = 500, details = null) => {
    const response = {
        success: false,
        message: message,
        statusCode: statusCode
    };

    if (details) {
        response.details = details;
    }

    return response;
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Custom AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json(
            errorResponse(err.message, err.statusCode)
        );
    }

    // Database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json(
            errorResponse('Duplicate entry', 409)
        );
    }

    if (err.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(400).json(
            errorResponse('Invalid field', 400)
        );
    }

    // File upload errors
    if (err.message === 'Only image files are allowed!') {
        return res.status(400).json(
            errorResponse('Only image files (JPEG, PNG, JPG) are allowed', 400)
        );
    }

    // Generic error
    return res.status(500).json(
        errorResponse('Internal server error', 500)
    );
};

module.exports = {
    AppError,
    errorResponse,
    errorHandler
};
