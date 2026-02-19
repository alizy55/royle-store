const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ✅ IMPORTANT: These must be BEFORE any routes
app.use(cors());
app.use(express.json()); // This parses JSON bodies
app.use(express.urlencoded({
    extended: true
})); // This parses form data

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/royal-store';

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err.message));

// ========== ROUTES ==========
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');

// ✅ Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);

// ✅ Valid Root Routes
app.get('/', (req, res) => res.send('✅ Royal Store Backend is Running! Access API at /api'));
app.get('/api', (req, res) => res.json({ message: 'Welcome to Royal Store API', status: 'Running' }));

// Test routes
app.get('/test', (req, res) => res.json({
    message: 'Server working'
}));
app.get('/api/test', (req, res) => res.json({
    message: 'API working'
}));

// ✅ Add this to check if body parser is working
app.post('/api/test-body', (req, res) => {
    console.log('Test body:', req.body);
    res.json({
        received: req.body
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`✅ SERVER RUNNING on port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}/test`);
    console.log(`👉 http://localhost:${PORT}/api/test`);
    console.log(`👉 http://localhost:${PORT}/api/test-body (POST)`);
    console.log('=================================');
});