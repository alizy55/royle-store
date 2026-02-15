const express = require('express');
const router = express.Router();
const {
    authMiddleware
} = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// ====================================
// ✅ GET SELLER'S PRODUCTS
// ====================================
router.get('/products',
    authMiddleware,
    roleMiddleware(['seller', 'admin']),
    async (req, res) => {
        try {
            const products = await Product.find({
                sellerId: req.userId,
                isActive: true
            }).sort({
                createdAt: -1
            });

            res.json(products);
        } catch (error) {
            console.error('Error fetching seller products:', error);
            res.status(500).json({
                error: 'Failed to fetch products'
            });
        }
    });

// ====================================
// ✅ GET SELLER'S ORDERS
// ====================================
router.get('/orders',
    authMiddleware,
    roleMiddleware(['seller', 'admin']),
    async (req, res) => {
        try {
            const orders = await Order.find({
                    'items.sellerId': req.userId
                })
                .populate('customerId', 'name email')
                .sort({
                    createdAt: -1
                });

            res.json(orders);
        } catch (error) {
            console.error('Error fetching seller orders:', error);
            res.json([]);
        }
    });

// ====================================
// ✅ GET SELLER'S CUSTOMERS
// ====================================
router.get('/customers',
    authMiddleware,
    roleMiddleware(['seller', 'admin']),
    async (req, res) => {
        try {
            const orders = await Order.find({
                'items.sellerId': req.userId
            }).populate('customerId', 'name email');

            const customerMap = new Map();

            orders.forEach(order => {
                if (order.customerId) {
                    const customerId = order.customerId._id.toString();
                    if (!customerMap.has(customerId)) {
                        customerMap.set(customerId, {
                            id: order.customerId._id,
                            name: order.customerId.name || 'Customer',
                            email: order.customerId.email || '',
                            orders: 0,
                            totalSpent: 0
                        });
                    }

                    const customer = customerMap.get(customerId);
                    customer.orders += 1;
                    customer.totalSpent += order.totalAmount || 0;
                }
            });

            res.json(Array.from(customerMap.values()));
        } catch (error) {
            console.error('Error fetching seller customers:', error);
            res.json([]);
        }
    });

// ====================================
// ✅ GET SELLER PROFILE
// ====================================
router.get('/profile',
    authMiddleware,
    roleMiddleware(['seller', 'admin']),
    async (req, res) => {
        try {
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                storeName: user.storeName || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                country: user.country || '',
                bio: user.bio || '',
                logo: user.logo || '',
                role: user.role
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({
                error: 'Failed to fetch profile'
            });
        }
    });

// ====================================
// ✅ UPDATE SELLER PROFILE
// ====================================
router.put('/profile',
    authMiddleware,
    roleMiddleware(['seller', 'admin']),
    async (req, res) => {
        try {
            const {
                name,
                storeName,
                phone,
                address,
                city,
                country,
                bio,
                logo
            } = req.body;

            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            if (name) user.name = name;
            if (storeName !== undefined) user.storeName = storeName;
            if (phone !== undefined) user.phone = phone;
            if (address !== undefined) user.address = address;
            if (city !== undefined) user.city = city;
            if (country !== undefined) user.country = country;
            if (bio !== undefined) user.bio = bio;
            if (logo !== undefined) user.logo = logo;

            await user.save();

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    storeName: user.storeName,
                    phone: user.phone,
                    address: user.address,
                    city: user.city,
                    country: user.country,
                    bio: user.bio,
                    logo: user.logo,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({
                error: 'Failed to update profile'
            });
        }
    });

// ====================================
// ✅ GET DASHBOARD STATS
// ====================================
router.get('/stats',
    authMiddleware,
    roleMiddleware(['seller', 'admin']),
    async (req, res) => {
        try {
            const products = await Product.find({
                sellerId: req.userId
            });
            const orders = await Order.find({
                'items.sellerId': req.userId
            });

            const totalProducts = products.length;
            const totalSales = products.reduce((sum, p) => sum + (p.sold || 0), 0);
            const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            const lowStockItems = products.filter(p => (p.stock || 0) < 10).length;
            const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;

            res.json({
                totalProducts,
                totalSales,
                totalRevenue,
                lowStockItems,
                pendingOrders,
                totalOrders: orders.length,
                totalProfit: totalRevenue * 0.3 // Approximate
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({
                error: 'Failed to fetch stats'
            });
        }
    });

module.exports = router;