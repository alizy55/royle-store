// backend/scripts/init-db.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeDatabase() {
    console.log('🔧 Initializing Royal Store Database...\n');

    try {
        // 1. Connect to MongoDB using your .env URI
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/royal-store';

        console.log('🔗 Connecting to MongoDB...');
        console.log('   URI:', mongoURI.replace(/mongodb:\/\/(.*):(.*)@/, 'mongodb://***:***@')); // Hide credentials

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });

        console.log('✅ Connected to MongoDB');
        console.log('   Database:', mongoose.connection.name);
        console.log('   Host:', mongoose.connection.host);
        console.log('   Port:', mongoose.connection.port);

        // 2. Drop existing database (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.log('\n🗑️  Dropping existing database for clean setup...');
            await mongoose.connection.db.dropDatabase();
            console.log('✅ Database cleared');
        }

        // 3. Import User model
        const User = require('../models/User');

        console.log('\n👥 Creating default users...');

        // 4. Create ADMIN user
        const adminPassword = await bcrypt.hash('Admin@123', 12);
        const admin = new User({
            name: 'Administrator',
            email: 'admin@royalstore.com',
            password: adminPassword,
            role: 'admin',
            isPremium: true,
            emailVerified: true
        });

        await admin.save();
        console.log('✅ Admin User Created:');
        console.log('   👑 Name: Administrator');
        console.log('   📧 Email: admin@royalstore.com');
        console.log('   🔑 Password: Admin@123');
        console.log('   🎯 Role: admin');
        console.log('   ⭐ Premium: Yes');

        // 5. Create SELLER user
        const sellerPassword = await bcrypt.hash('Seller@123', 12);
        const seller = new User({
            name: 'Royal Seller',
            email: 'seller@royalstore.com',
            password: sellerPassword,
            role: 'seller',
            isPremium: true,
            emailVerified: true
        });

        await seller.save();
        console.log('\n✅ Seller User Created:');
        console.log('   🛍️  Name: Royal Seller');
        console.log('   📧 Email: seller@royalstore.com');
        console.log('   🔑 Password: Seller@123');
        console.log('   🎯 Role: seller');
        console.log('   ⭐ Premium: Yes');

        // 6. Create CUSTOMER user
        const customerPassword = await bcrypt.hash('Customer@123', 12);
        const customer = new User({
            name: 'Test Customer',
            email: 'customer@royalstore.com',
            password: customerPassword,
            role: 'customer',
            emailVerified: true
        });

        await customer.save();
        console.log('\n✅ Customer User Created:');
        console.log('   👤 Name: Test Customer');
        console.log('   📧 Email: customer@royalstore.com');
        console.log('   🔑 Password: Customer@123');
        console.log('   🎯 Role: customer');
        console.log('   ⭐ Premium: No');

        // 7. Create YOUR personal account
        const yourPassword = await bcrypt.hash('Sam@123456', 12);
        const yourAccount = new User({
            name: 'Sam',
            email: 'alizyishfaq7@gmail.com', // Your email from .env
            password: yourPassword,
            role: 'seller',
            isPremium: true,
            emailVerified: true
        });

        await yourAccount.save();
        console.log('\n✅ Your Personal Account Created:');
        console.log('   👤 Name: Sam');
        console.log('   📧 Email: alizyishfaq7@gmail.com');
        console.log('   🔑 Password: Sam@123456');
        console.log('   🎯 Role: seller');
        console.log('   ⭐ Premium: Yes');

        // 8. Count total users
        const userCount = await User.countDocuments();

        console.log('\n📊 DATABASE SUMMARY:');
        console.log('   Total Users:', userCount);
        console.log('   Database:', mongoose.connection.name);
        console.log('   Status: ✅ READY FOR USE');

        console.log('\n🎉 DATABASE INITIALIZATION COMPLETE!');
        console.log('\n🚀 Next Steps:');
        console.log('   1. Start your server: npm start');
        console.log('   2. Login with any of the accounts above');
        console.log('   3. Access dashboard: http://localhost:3004');

        // 9. Close connection
        await mongoose.disconnect();
        console.log('\n🔌 MongoDB connection closed');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ DATABASE INITIALIZATION FAILED:');
        console.error('   Error:', error.name);
        console.error('   Message:', error.message);

        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure MongoDB is running:');
        console.log('      net start MongoDB');
        console.log('   2. Check MongoDB connection:');
        console.log('      mongodb://localhost:27017');
        console.log('   3. Verify your .env MONGO_URI is correct');

        if (error.code === 'ENOTFOUND') {
            console.log('\n⚠️  MongoDB not found at localhost:27017');
            console.log('   Start MongoDB service or install it');
        }

        if (error.code === 'ECONNREFUSED') {
            console.log('\n⚠️  Connection refused - MongoDB not running');
            console.log('   Run: mongod --dbpath "C:\\data\\db"');
        }

        process.exit(1);
    }
}

// Run the initialization
initializeDatabase();