const Product = require('../models/Product');

// ====================================
// ✅ CREATE PRODUCT (FIXED - WORKING VERSION)
// ====================================
exports.createProduct = async (req, res) => {
    try {
        console.log('📦 Creating product for seller:', req.userId);
        console.log('📦 Product data received:', req.body);

        const {
            name,
            title,
            price,
            cost,
            description,
            category,
            subCategory,
            stock,
            sku,
            brand,
            weight,
            dimensions,
            warranty,
            material,
            colors,
            sizes,
            images,
            tags,
            featured,
            flashSale,
            discount,
            careInstructions
        } = req.body;

        // ---------- VALIDATION ----------
        if (!name && !title) {
            return res.status(400).json({
                success: false,
                message: 'Product name is required'
            });
        }

        if (!price) {
            return res.status(400).json({
                success: false,
                message: 'Price is required'
            });
        }

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        // ---------- GET SELLER INFO ----------
        const User = require('../models/User');
        const seller = await User.findById(req.userId);

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // ---------- CREATE PRODUCT (FIXED FIELD NAMES) ----------
        const productData = {
            // Basic Info
            title: title || name,
            name: name || title,
            description: description || '',

            // Pricing
            price: Number(price),
            cost: cost ? Number(cost) : Number(price) * 0.7,

            // Category
            category: category,
            subCategory: subCategory || '',

            // Inventory
            stock: stock ? Number(stock) : 0,
            sku: sku || `SKU-${Date.now().toString().slice(-8)}`,
            brand: brand || 'Generic',
            weight: weight || '',
            dimensions: dimensions || '',
            warranty: warranty || '',
            material: material || '',

            // Variations
            colors: colors || [],
            sizes: sizes || [],

            // Media
            images: images && images.length > 0 ? images : [],

            // Tags & Features
            tags: tags || [],
            featured: featured || false,
            flashSale: flashSale || false,
            discount: discount ? Number(discount) : 0,
            careInstructions: careInstructions || '',

            // Seller Info - CRITICAL: Use sellerId NOT seller
            sellerId: req.userId,
            sellerName: seller.name || seller.storeName || 'Seller',

            // Stats
            sold: 0,
            sales: 0,
            views: 0,
            rating: 0,
            reviews: 0,

            // Status
            isActive: true,
            status: 'active'
        };

        // Calculate profit
        productData.profit = productData.price - productData.cost;
        productData.profitMargin = Number(((productData.profit / productData.price) * 100).toFixed(1));

        // Create and save product
        const product = new Product(productData);
        await product.save();

        console.log('✅ Product created successfully! ID:', product._id);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: product
        });

    } catch (error) {
        console.error('❌ Create product error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'SKU already exists. Please use a different SKU.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create product. Please try again.'
        });
    }
};

// ====================================
// ✅ GET SELLER'S PRODUCTS
// ====================================
exports.getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({
            sellerId: req.userId,
            isActive: true
        }).sort({
            createdAt: -1
        });

        res.json({
            success: true,
            count: products.length,
            products: products
        });
    } catch (error) {
        console.error('Get my products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
};

// ====================================
// ✅ GET SINGLE PRODUCT
// ====================================
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('sellerId', 'name email storeName');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Increment views
        product.views = (product.views || 0) + 1;
        await product.save();

        res.json({
            success: true,
            product: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
};

// ====================================
// ✅ UPDATE PRODUCT
// ====================================
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            sellerId: req.userId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        const {
            name,
            title,
            price,
            cost,
            description,
            category,
            subCategory,
            stock,
            sku,
            brand,
            weight,
            dimensions,
            warranty,
            material,
            colors,
            sizes,
            images,
            tags,
            featured,
            flashSale,
            discount,
            careInstructions,
            status
        } = req.body;

        // Update fields
        if (title) product.title = title;
        if (name) product.name = name;
        if (price) product.price = Number(price);
        if (cost) product.cost = Number(cost);
        if (description !== undefined) product.description = description;
        if (category) product.category = category;
        if (subCategory !== undefined) product.subCategory = subCategory;
        if (stock !== undefined) product.stock = Number(stock);
        if (sku) product.sku = sku;
        if (brand !== undefined) product.brand = brand;
        if (weight !== undefined) product.weight = weight;
        if (dimensions !== undefined) product.dimensions = dimensions;
        if (warranty !== undefined) product.warranty = warranty;
        if (material !== undefined) product.material = material;
        if (colors) product.colors = colors;
        if (sizes) product.sizes = sizes;
        if (images) product.images = images;
        if (tags) product.tags = tags;
        if (featured !== undefined) product.featured = featured;
        if (flashSale !== undefined) product.flashSale = flashSale;
        if (discount !== undefined) product.discount = Number(discount);
        if (careInstructions !== undefined) product.careInstructions = careInstructions;
        if (status) product.status = status;

        // Recalculate profit
        product.profit = product.price - product.cost;
        product.profitMargin = Number(((product.profit / product.price) * 100).toFixed(1));

        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product'
        });
    }
};

// ====================================
// ✅ DELETE PRODUCT
// ====================================
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            sellerId: req.userId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        // Soft delete
        product.isActive = false;
        product.status = 'inactive';
        await product.save();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
};

// ====================================
// ✅ GET ALL PRODUCTS (PUBLIC)
// ====================================
exports.getAllProducts = async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            sort
        } = req.query;

        let query = {
            isActive: true,
            status: 'active'
        };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [{
                    title: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    name: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    brand: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortOption = {
            createdAt: -1
        };
        if (sort === 'price_low') sortOption = {
            price: 1
        };
        if (sort === 'price_high') sortOption = {
            price: -1
        };
        if (sort === 'newest') sortOption = {
            createdAt: -1
        };
        if (sort === 'oldest') sortOption = {
            createdAt: 1
        };
        if (sort === 'popular') sortOption = {
            sales: -1
        };
        if (sort === 'rating') sortOption = {
            rating: -1
        };

        const products = await Product.find(query)
            .populate('sellerId', 'name storeName')
            .sort(sortOption);

        res.json({
            success: true,
            count: products.length,
            products: products
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
};