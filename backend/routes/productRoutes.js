const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User'); // ADD THIS LINE
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// GET all products (for customers)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({
                status: 'active'
            })
            .populate('sellerId', 'name storeName email')
            .sort('-createdAt');

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET products by seller
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const products = await Product.find({
                sellerId: req.params.sellerId
            })
            .sort('-createdAt');

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching seller products:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('sellerId', 'name storeName email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// CREATE product with image upload
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        console.log('Creating product with files:', req.files);
        console.log('Product data:', req.body);

        const productData = JSON.parse(JSON.stringify(req.body)); // Clone the body

        // Add image URLs if files were uploaded
        if (req.files && req.files.length > 0) {
            productData.images = req.files.map(file =>
                `http://127.0.0.1:5000/api/products/uploads/${file.filename}`
            );
        }

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// UPDATE product with image upload
router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updateData = JSON.parse(JSON.stringify(req.body));

        // Add new image URLs if files were uploaded
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file =>
                `http://127.0.0.1:5000/api/products/uploads/${file.filename}`
            );

            // If keepExistingImages is true, append to existing images
            if (req.body.keepExistingImages === 'true') {
                updateData.images = [...(product.images || []), ...newImages];
            } else {
                // Replace all images
                updateData.images = newImages;

                // Delete old images from server
                if (product.images && product.images.length > 0) {
                    product.images.forEach(imageUrl => {
                        const filename = imageUrl.split('/').pop();
                        const filePath = path.join(__dirname, '../uploads', filename);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    });
                }
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData, {
                new: true
            }
        );

        res.json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== UPDATED DELETE PRODUCT ==========
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get user ID from headers
        const userId = req.headers['user-id'];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User ID required'
            });
        }

        // Find the user to check if they are admin
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is admin OR the seller who owns this product
        if (user.role !== 'admin' && product.sellerId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized. Only admin or product owner can delete this product.'
            });
        }

        // Delete image files from server
        if (product.images && product.images.length > 0) {
            product.images.forEach(imageUrl => {
                const filename = imageUrl.split('/').pop();
                const filePath = path.join(__dirname, '../uploads', filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;