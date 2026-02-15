const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Order.aggregate([{
                    $match: {
                        paymentStatus: 'paid'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$totalAmount'
                        }
                    }
                }
            ])
        ]);

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({
                createdAt: -1
            })
            .limit(5)
            .populate('customerId', 'name email');

        // Get recent users
        const recentUsers = await User.find()
            .sort({
                createdAt: -1
            })
            .limit(5)
            .select('-password');

        // Get top selling products
        const topProducts = await Product.find()
            .sort({
                sold: -1
            })
            .limit(5)
            .populate('sellerId', 'name');

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0
            },
            recentOrders,
            recentUsers,
            topProducts
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const {
            page = 1, limit = 20, role
        } = req.query;

        let query = {};
        if (role) query.role = role;

        const users = await User.find(query)
            .select('-password')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({
                createdAt: -1
            });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
    try {
        const {
            userId
        } = req.params;
        const {
            role,
            isActive
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from modifying themselves
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify your own account'
            });
        }

        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const {
            userId
        } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Delete user's products
        await Product.deleteMany({
            sellerId: userId
        });

        // Delete user's cart
        await Cart.deleteMany({
            userId
        });

        // Delete user
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'User and associated data deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const {
            page = 1, limit = 20, status
        } = req.query;

        let query = {};
        if (status) query.orderStatus = status;

        const orders = await Order.find(query)
            .populate('customerId', 'name email')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({
                createdAt: -1
            });

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const {
            orderId
        } = req.params;
        const {
            orderStatus,
            paymentStatus
        } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated',
            order
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all products (admin only)
exports.getAllProducts = async (req, res) => {
    try {
        const {
            page = 1, limit = 20, category
        } = req.query;

        let query = {};
        if (category) query.category = category;

        const products = await Product.find(query)
            .populate('sellerId', 'name email')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({
                createdAt: -1
            });

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            products,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
    try {
        const {
            productId
        } = req.params;
        const {
            status,
            featured
        } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (status) product.status = status;
        if (featured !== undefined) product.featured = featured;

        await product.save();

        res.json({
            success: true,
            message: 'Product updated',
            product
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};