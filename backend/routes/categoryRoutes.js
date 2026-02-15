const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// ========== GET ALL CATEGORIES (PUBLIC) ==========
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({
                status: 'active'
            })
            .populate('parentCategory', 'name')
            .sort({
                name: 1
            });

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== GET ALL CATEGORIES WITH PARENT (FOR ADMIN) ==========
router.get('/all', async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('parentCategory', 'name')
            .sort({
                name: 1
            });

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== GET SINGLE CATEGORY ==========
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parentCategory', 'name');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== CREATE CATEGORY (ADMIN ONLY) ==========
router.post('/', async (req, res) => {
    try {
        const {
            name,
            description,
            parentCategory,
            image,
            status
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({
            name
        });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }

        // Create slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const category = new Category({
            name,
            slug,
            description: description || '',
            parentCategory: parentCategory || null,
            image: image || '',
            status: status || 'active'
        });

        await category.save();

        res.status(201).json({
            success: true,
            data: category,
            message: 'Category created successfully'
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== UPDATE CATEGORY (ADMIN ONLY) ==========
router.put('/:id', async (req, res) => {
    try {
        const {
            name,
            description,
            parentCategory,
            image,
            status
        } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Update fields
        if (name) {
            category.name = name;
            category.slug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }
        if (description !== undefined) category.description = description;
        if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
        if (image !== undefined) category.image = image;
        if (status) category.status = status;

        await category.save();

        res.json({
            success: true,
            data: category,
            message: 'Category updated successfully'
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== DELETE CATEGORY (ADMIN ONLY) ==========
router.delete('/:id', async (req, res) => {
    try {
        // Check if any products use this category
        const Product = require('../models/Product');
        const productsInCategory = await Product.countDocuments({
            category: req.params.id
        });

        if (productsInCategory > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${productsInCategory} products use this category.`
            });
        }

        // Check if any subcategories exist
        const subcategories = await Category.countDocuments({
            parentCategory: req.params.id
        });

        if (subcategories > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${subcategories} subcategories exist.`
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;