const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        required: true,
        select: false // Don't return password by default
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
    lastLogin: Date,
    loginCount: {
        type: Number,
        default: 0
    },
    isActive: { // Added for compatibility with controller
        type: Boolean,
        default: true
    },
    isPremium: { // Added for compatibility with controller
        type: Boolean,
        default: false
    },
    emailVerified: { // Added for compatibility with controller
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);