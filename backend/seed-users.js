const mongoose = require('mongoose');
require('dotenv').config();

async function seedUsers() {
    try {
        console.log('🔗 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/royal-store');

        const User = require('./models/User');

        // Delete all existing users (optional - comment if you want to keep)
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Define users to create
        const users = [{
                name: 'System Administrator',
                email: 'admin@royalstore.com',
                password: 'Admin@123',
                role: 'admin',
                isPremium: true,
                emailVerified: true
            },
            {
                name: 'Premium Seller',
                email: 'seller@royalstore.com',
                password: 'Seller@123',
                role: 'seller',
                isPremium: true,
                emailVerified: true
            },
            {
                name: 'Test Customer',
                email: 'customer@royalstore.com',
                password: 'Customer@123',
                role: 'customer',
                isPremium: false,
                emailVerified: true
            },
            {
                name: 'Ali Zishfaq',
                email: 'alizyishfaq7@gmail.com',
                password: 'Sam@123456',
                role: 'customer',
                isPremium: false,
                emailVerified: true
            }
        ];

        // Create users
        const createdUsers = [];
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
            console.log(`✅ Created: ${user.email} (${user.role})`);
        }

        // Verify creation
        const totalUsers = await User.countDocuments();
        console.log('\n📊 DATABASE STATUS:');
        console.log(`Total users: ${totalUsers}`);

        // List all users (without passwords)
        const allUsers = await User.find({});
        console.log('\n👥 ALL USERS:');
        allUsers.forEach(u => {
            console.log(`- ${u.email.padEnd(30)} [${u.role}] - Verified: ${u.emailVerified}`);
        });

        console.log('\n🔑 TEST CREDENTIALS:');
        console.log('══════════════════════════════════════════');
        console.log('1. ADMIN:    admin@royalstore.com    / Admin@123');
        console.log('2. SELLER:   seller@royalstore.com   / Seller@123');
        console.log('3. CUSTOMER: customer@royalstore.com / Customer@123');
        console.log('4. YOU:      alizyishfaq7@gmail.com  / Sam@123456');
        console.log('══════════════════════════════════════════');

        console.log('\n🚀 Ready to login!');
        console.log('Frontend: http://localhost:3000');
        console.log('Backend API: http://localhost:5000');

        mongoose.disconnect();

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run the seeding
seedUsers();