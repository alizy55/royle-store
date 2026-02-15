require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express app
const app = express();

// SIMPLE Middleware - NO complex error handlers
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next(); // This next SHOULD be available
});

// Test endpoint - NO database
app.post('/api/debug', (req, res) => {
    console.log('Debug endpoint hit!');
    res.json({
        success: true,
        message: 'Debug endpoint works',
        body: req.body
    });
});

// Test endpoint WITH database but SIMPLE
app.post('/api/debug-register', async (req, res) => {
    try {
        console.log('Debug register hit');

        // Simulate user creation WITHOUT actual model
        const mockUser = {
            _id: 'debug-id',
            name: req.body.name || 'Test',
            email: req.body.email || 'test@test.com',
            role: 'customer'
        };

        res.json({
            success: true,
            message: 'Debug registration works',
            user: mockUser
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug error',
            error: error.message
        });
    }
});

// Test your actual auth route but SIMPLIFIED
const simplifiedAuthController = {
    register: async (req, res) => {
        console.log('Simplified register called');
        try {
            const {
                name,
                email,
                password
            } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing fields'
                });
            }

            // Don't save to DB yet
            res.json({
                success: true,
                message: 'Would register user',
                data: {
                    name,
                    email
                }
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error',
                error: error.message
            });
        }
    }
};

app.post('/api/auth/debug-register', simplifiedAuthController.register);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('================================');
    console.log('🔧 DEBUG SERVER RUNNING');
    console.log(`✅ Server: http://localhost:${PORT}`);
    console.log('================================');
    console.log('Endpoints:');
    console.log('1. POST /api/debug');
    console.log('2. POST /api/debug-register');
    console.log('3. POST /api/auth/debug-register');
    console.log('================================');
});