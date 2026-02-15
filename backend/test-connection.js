const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Atlas Connection...');
console.log('========================================');

// Hide password in log
const safeURI = process.env.MONGO_URI.replace(/:[^@]*@/, ':****@');
console.log('Connecting to:', safeURI);

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);

        // List collections (optional)
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Collections:', collections.map(c => c.name).join(', ') || 'No collections yet');

        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ ERROR: Connection failed!');
        console.error('Message:', error.message);
        console.error('Error Code:', error.code);

        if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
            console.log('\n🔧 Possible fixes:');
            console.log('1. Check password: aliza1234567890');
            console.log('2. Go to MongoDB Atlas → Network Access → Add IP Address: 0.0.0.0/0');
            console.log('3. Wait 2-3 minutes after adding IP');
        } else if (error.code === 'ENOTFOUND') {
            console.log('\n🌐 Network issue - check internet connection');
        }

        process.exit(1);
    });