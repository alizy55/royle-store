// Test to find where "next is not a function" comes from

// Test 1: Check if User model causes error
try {
    const User = require('./models/User');
    console.log('✅ User model loaded successfully');
} catch (err) {
    console.log('❌ Error loading User model:', err.message);
}

// Test 2: Check if authController has issues
try {
    const authController = require('./controllers/authController');
    console.log('✅ Auth controller loaded successfully');
} catch (err) {
    console.log('❌ Error loading auth controller:', err.message);
}

// Test 3: Check if routes have issues
try {
    const authRoutes = require('./routes/authRoutes');
    console.log('✅ Auth routes loaded successfully');
} catch (err) {
    console.log('❌ Error loading auth routes:', err.message);
}

// Test 4: Check middleware
try {
    const authMiddleware = require('./middleware/authMiddleware');
    console.log('✅ Auth middleware loaded successfully');
} catch (err) {
    console.log('❌ Error loading auth middleware:', err.message);
}

console.log('\n🎯 All modules checked!');