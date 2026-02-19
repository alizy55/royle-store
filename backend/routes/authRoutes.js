const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
    res.json({
        message: 'Auth routes working!'
    });
});

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;