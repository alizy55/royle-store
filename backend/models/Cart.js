const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    title: String
});

const cartSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate total before saving
cartSchema.pre('save', function(next) {
    this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Cart', cartSchema);