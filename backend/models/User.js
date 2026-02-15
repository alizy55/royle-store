const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'seller', 'customer'],
        default: 'customer'
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'blocked'],
        default: 'active'
    },
    storeName: String,
    phone: String,
    address: String,
    city: String,
    bio: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);