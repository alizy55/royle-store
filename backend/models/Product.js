const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    cost: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    brand: String,
    stock: {
        type: Number,
        default: 0
    },
    soldCount: {
        type: Number,
        default: 0
    },
    sku: String,
    tags: [String],
    images: [String], // Array of image URLs
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'blocked'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);