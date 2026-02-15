const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Test route
router.get('/test', (req, res) => {
    res.json({
        message: 'Auth routes working!'
    });
});

// LOGIN ROUTE - FIXED VERSION
router.post('/login', async (req, res) => {
    console.log('Login attempt:', req.body);

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password required'
        });
    }

    try {
        // Find user in database
        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // FIX: Use bcrypt to compare passwords instead of hardcoded check
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign({
                userId: user._id,
                email: user.email,
                role: user.role
            },
            'your-secret-key', {
                expiresIn: '7d'
            }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                storeName: user.storeName || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                bio: user.bio || ''
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// UPDATE PROFILE
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token'
            });
        }

        const decoded = jwt.verify(token, 'your-secret-key');
        const {
            name,
            storeName,
            phone,
            address,
            city,
            bio
        } = req.body;

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (storeName !== undefined) user.storeName = storeName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (city !== undefined) user.city = city;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                storeName: user.storeName,
                phone: user.phone,
                address: user.address,
                city: user.city,
                bio: user.bio
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET CURRENT USER
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token'
            });
        }

        const decoded = jwt.verify(token, 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                storeName: user.storeName || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                bio: user.bio || ''
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

module.exports = router;