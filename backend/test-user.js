require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testUserCreation() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Create a test user
        const testUser = new User({
            name: 'Test User',
            email: 'test@test.com',
            password: 'password123',
            role: 'customer'
        });

        console.log('📝 Attempting to save user...');
        const savedUser = await testUser.save();
        console.log('✅ User saved successfully!');
        console.log('📊 User data:', {
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            hashedPassword: savedUser.password
        });

        // Test password comparison
        const isMatch = await savedUser.comparePassword('password123');
        console.log('🔑 Password comparison:', isMatch ? '✅ Correct' : '❌ Incorrect');

        // Clean up
        await User.deleteOne({
            email: 'test@test.com'
        });
        console.log('🧹 Test user cleaned up');

        mongoose.disconnect();
        console.log('✅ Test completed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('🔍 Stack trace:', error.stack);
    }
}

testUserCreation();