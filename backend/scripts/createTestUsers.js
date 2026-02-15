const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/royal-store';

const createTestUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Hash passwords
        const hashedAdmin = await bcrypt.hash('Admin@123', 10);
        const hashedSeller = await bcrypt.hash('Seller@123', 10);
        const hashedCustomer = await bcrypt.hash('Customer@123', 10);

        // Create admin
        await User.findOneAndUpdate({
            email: 'admin@royalstore.com'
        }, {
            name: 'Admin User',
            email: 'admin@royalstore.com',
            password: hashedAdmin,
            role: 'admin',
            status: 'active'
        }, {
            upsert: true,
            new: true
        });
        console.log('✅ Admin created');

        // Create seller
        const seller = await User.findOneAndUpdate({
            email: 'seller@royalstore.com'
        }, {
            name: 'Aliza',
            email: 'seller@royalstore.com',
            password: hashedSeller,
            role: 'seller',
            status: 'active',
            storeName: 'Aliza Fashion',
            phone: '1234567890',
            city: 'New York'
        }, {
            upsert: true,
            new: true
        });
        console.log('✅ Seller created with ID:', seller._id);

        // Create customer
        await User.findOneAndUpdate({
            email: 'customer@royalstore.com'
        }, {
            name: 'John Customer',
            email: 'customer@royalstore.com',
            password: hashedCustomer,
            role: 'customer',
            status: 'active'
        }, {
            upsert: true,
            new: true
        });
        console.log('✅ Customer created');

        console.log('\n✅ Test users created successfully!');
        console.log('\n📝 Login credentials:');
        console.log('Admin - admin@royalstore.com / Admin@123');
        console.log('Seller - seller@royalstore.com / Seller@123');
        console.log('Customer - customer@royalstore.com / Customer@123');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTestUsers();