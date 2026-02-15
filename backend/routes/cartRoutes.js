const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Middleware to get customer ID from header
const getCustomerId = (req, res, next) => {
    const customerId = req.headers['user-id'];
    if (!customerId) {
        return res.status(401).json({
            success: false,
            message: 'User ID required'
        });
    }
    req.customerId = customerId;
    next();
};

// ========== GET CART ==========
router.get('/', getCustomerId, async (req, res) => {
    try {
        let cart = await Cart.findOne({
                customerId: req.customerId
            })
            .populate('items.productId', 'title price stock images');

        if (!cart) {
            cart = new Cart({
                customerId: req.customerId,
                items: []
            });
            await cart.save();
        }

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== ADD TO CART ==========
router.post('/add', getCustomerId, async (req, res) => {
    try {
        const {
            productId,
            quantity = 1
        } = req.body;

        // Check if product exists and has stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({
            customerId: req.customerId
        });
        if (!cart) {
            cart = new Cart({
                customerId: req.customerId,
                items: []
            });
        }

        // Check if product already in cart
        const existingItem = cart.items.find(item => item.productId.toString() === productId);

        if (existingItem) {
            // Check if total quantity would exceed stock
            if (product.stock < existingItem.quantity + quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot add more than available stock'
                });
            }
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId,
                quantity,
                price: product.price,
                title: product.title
            });
        }

        await cart.save();

        // Populate product details
        await cart.populate('items.productId', 'title price stock images');

        res.json({
            success: true,
            data: cart,
            message: 'Product added to cart'
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== UPDATE CART ITEM QUANTITY ==========
router.put('/update/:productId', getCustomerId, async (req, res) => {
    try {
        const {
            productId
        } = req.params;
        const {
            quantity
        } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        const cart = await Cart.findOne({
            customerId: req.customerId
        });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not in cart'
            });
        }

        // Check stock
        const product = await Product.findById(productId);
        if (product && product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        item.quantity = quantity;
        await cart.save();

        await cart.populate('items.productId', 'title price stock images');

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== REMOVE FROM CART ==========
router.delete('/remove/:productId', getCustomerId, async (req, res) => {
    try {
        const {
            productId
        } = req.params;

        const cart = await Cart.findOne({
            customerId: req.customerId
        });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();

        res.json({
            success: true,
            data: cart,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== CLEAR CART ==========
router.delete('/clear', getCustomerId, async (req, res) => {
    try {
        const cart = await Cart.findOne({
            customerId: req.customerId
        });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;