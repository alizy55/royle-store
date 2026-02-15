const mongoose = require('mongoose');
const Category = require('../models/Category');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/royal-store';

const createCategories = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const categories = [{
                name: 'Electronics',
                description: 'Latest gadgets and electronic items'
            },
            {
                name: 'Fashion',
                description: 'Clothing, shoes, and accessories'
            },
            {
                name: 'Home & Living',
                description: 'Furniture, decor, and home essentials'
            },
            {
                name: 'Books',
                description: 'Books, magazines, and educational materials'
            },
            {
                name: 'Sports',
                description: 'Sports equipment and outdoor gear'
            },
            {
                name: 'Beauty',
                description: 'Cosmetics, skincare, and personal care'
            },
            {
                name: 'Toys',
                description: 'Toys, games, and entertainment'
            },
            {
                name: 'Automotive',
                description: 'Car accessories and automotive parts'
            }
        ];

        for (const cat of categories) {
            await Category.findOneAndUpdate({
                name: cat.name
            }, {
                ...cat,
                status: 'active',
                slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            }, {
                upsert: true,
                new: true
            });
            console.log(`✅ Created/Updated: ${cat.name}`);
        }

        console.log('\n✅ All categories created successfully!');
        console.log('\n📊 Categories in database:');
        const allCategories = await Category.find();
        allCategories.forEach(c => console.log(`   - ${c.name} (${c.slug})`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createCategories();