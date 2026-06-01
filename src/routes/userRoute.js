    
const {
    GetUser,
    GetOne,
    Create,
    Update,
    Delete,
    login,
    sendOTP,
    verifyOtp,
    resetPassword
} = require('../controller/userController');

const Users = (app) => {

    app.get('/api/user', GetUser); // Get all users
    app.get('/api/user/:id', GetOne); // Get one user
    app.post('/api/user', Create); // Create user
    app.put('/api/user/:id', Update); // Update user
    app.delete('/api/user/:id', Delete); // Delete user
    app.post('/api/user/login', login); // Login
    app.post('/api/user/sendOTP', sendOTP); // Send OTP
    app.post('/api/user/verifyOTP', verifyOtp); // Verify OTP
    app.post('/api/user/resetPassword', resetPassword); // Reset password
};


module.exports = Users ;