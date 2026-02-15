const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const userId = req.headers['user-id'];
        const user = await User.findById(userId);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ========== DASHBOARD STATS ==========
router.get('/dashboard/stats', isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSellers = await User.countDocuments({
            role: 'seller'
        });
        const totalCustomers = await User.countDocuments({
            role: 'customer'
        });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const pendingSellers = await User.countDocuments({
            role: 'seller',
            status: 'pending'
        });

        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalSellers,
                totalCustomers,
                totalProducts,
                totalOrders,
                totalRevenue,
                pendingSellers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== GET ALL USERS ==========
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({
            createdAt: -1
        });
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== APPROVE SELLER ==========
router.put('/approve-seller/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id, {
                status: 'active'
            }, {
                new: true
            }
        ).select('-password');

        res.json({
            success: true,
            message: 'Seller approved',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== DELETE USER ==========
router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        if (user.role === 'seller') {
            await Product.deleteMany({
                sellerId: user._id
            });
        }

        res.json({
            success: true,
            message: 'User deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== GET ALL PRODUCTS ==========
router.get('/products', isAdmin, async (req, res) => {
    try {
        const products = await Product.find()
            .populate('sellerId', 'name email storeName')
            .sort({
                createdAt: -1
            });
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== DELETE PRODUCT ==========
router.delete('/products/:id', isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Product deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== GET ALL ORDERS ==========
router.get('/orders', isAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customerId', 'name email')
            .populate('items.productId', 'title price')
            .sort({
                createdAt: -1
            });
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;