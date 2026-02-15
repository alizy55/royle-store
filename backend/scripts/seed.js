const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/royal-store');

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});

        // Create admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@royalstore.com',
            password: bcrypt.hashSync('Admin@123', 10),
            role: 'admin',
            status: 'active'
        });

        // Create sellers
        const seller1 = await User.create({
            name: 'Aliza',
            email: 'alizvishfaq7@gmail.com',
            password: bcrypt.hashSync('Seller@123', 10),
            role: 'seller',
            status: 'active',
            storeName: 'Aliza Fashion Store',
            phone: '1234567890'
        });

        const seller2 = await User.create({
            name: 'Tech Hub',
            email: 'seller2@test.com',
            password: bcrypt.hashSync('Seller@123', 10),
            role: 'seller',
            status: 'pending',
            storeName: 'Tech Hub Store'
        });

        // Create customers
        const customer1 = await User.create({
            name: 'John Customer',
            email: 'customer1@test.com',
            password: bcrypt.hashSync('Customer@123', 10),
            role: 'customer',
            status: 'active'
        });

        // Create products
        await Product.create([{
                title: 'iPhone 13',
                price: 799,
                cost: 650,
                category: 'Electronics',
                description: 'Latest iPhone',
                stock: 45,
                sellerId: seller1._id,
                status: 'active'
            },
            {
                title: 'Nike Shoes',
                price: 199,
                cost: 120,
                category: 'Fashion',
                description: 'Running shoes',
                stock: 56,
                sellerId: seller1._id,
                status: 'active'
            },
            {
                title: 'Samsung TV',
                price: 1299,
                cost: 1000,
                category: 'Electronics',
                description: '4K Smart TV',
                stock: 8,
                sellerId: seller2._id,
                status: 'pending'
            }
        ]);

        console.log('✅ Database seeded successfully!');
        console.log('Admin: admin@royalstore.com / Admin@123');
        console.log('Seller: alizvishfaq7@gmail.com / Seller@123');
        process.exit();
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
};

seedData();