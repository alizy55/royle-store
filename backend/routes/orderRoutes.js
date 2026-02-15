const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// ========== CREATE ORDER ==========
router.post('/create', async (req, res) => {
    try {
        console.log('Creating order:', req.body);

        const {
            items,
            totalAmount,
            customerId,
            shippingAddress
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items in order'
            });
        }

        // Get customer details
        const customer = await User.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Get unique seller IDs from items
        const sellerStatuses = [];
        const sellerMap = new Map();

        // Update product sold counts and collect seller info
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (product) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: {
                        soldCount: item.quantity,
                        stock: -item.quantity
                    }
                });

                // Add seller to status tracking if not already added
                if (product.sellerId && !sellerMap.has(product.sellerId.toString())) {
                    sellerMap.set(product.sellerId.toString(), true);
                    sellerStatuses.push({
                        sellerId: product.sellerId,
                        status: 'pending'
                    });
                }

                // Add sellerId to item for easy reference
                item.sellerId = product.sellerId;
            }
        }

        // Create order
        const order = new Order({
            customerId,
            customerName: customer.name,
            customerEmail: customer.email,
            items,
            totalAmount,
            shippingAddress: shippingAddress || {
                address: customer.address || '',
                city: customer.city || '',
                phone: customer.phone || ''
            },
            status: 'pending',
            sellerStatuses
        });

        await order.save();

        // Populate the order before sending response
        await order.populate('customerId', 'name email');
        await order.populate('items.productId', 'title price images');

        res.json({
            success: true,
            message: 'Order placed successfully!',
            data: order
        });

    } catch (error) {
        console.error('Order error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== GET CUSTOMER ORDERS ==========
router.get('/my-orders', async (req, res) => {
    try {
        const customerId = req.headers['user-id'];
        const orders = await Order.find({
                customerId
            })
            .populate('items.productId', 'title price images')
            .sort({
                createdAt: -1
            });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== GET SELLER ORDERS ==========
router.get('/seller/orders', async (req, res) => {
    try {
        const sellerId = req.headers['user-id'];

        // Find orders that contain products from this seller
        const orders = await Order.find({
                'items.sellerId': sellerId
            })
            .populate('customerId', 'name email')
            .populate('items.productId', 'title price images')
            .sort({
                createdAt: -1
            });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== UPDATE ORDER STATUS (for sellers) ==========
router.put('/:id/status', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const {
            status
        } = req.body;
        const sellerId = req.headers['user-id'];

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update seller-specific status
        const sellerStatus = order.sellerStatuses.find(s => s.sellerId.toString() === sellerId);
        if (sellerStatus) {
            sellerStatus.status = status;
            sellerStatus.updatedAt = Date.now();
        }

        // Check if all sellers have accepted/shipped/delivered
        const allSellersStatus = order.sellerStatuses.map(s => s.status);

        if (status === 'rejected') {
            // If any seller rejects, order is rejected
            order.status = 'rejected';
        } else if (allSellersStatus.every(s => s === 'delivered')) {
            order.status = 'delivered';
        } else if (allSellersStatus.every(s => s === 'shipped' || s === 'delivered')) {
            order.status = 'shipped';
        } else if (allSellersStatus.every(s => s === 'accepted' || s === 'shipped' || s === 'delivered')) {
            order.status = 'processing';
        }

        await order.save();

        res.json({
            success: true,
            data: order,
            message: `Order status updated to ${status}`
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== GET ALL ORDERS (ADMIN) ==========
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customerId', 'name email')
            .populate('items.productId', 'title price')
            .populate('sellerStatuses.sellerId', 'name storeName')
            .sort({
                createdAt: -1
            });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;