const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    title: String,
    price: Number,
    quantity: Number,
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: String,
    customerEmail: String,
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        default: 'Cash on Delivery'
    },
    shippingAddress: {
        address: String,
        city: String,
        phone: String
    },
    sellerStatuses: [{
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'shipped', 'delivered']
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate order ID before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderId) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderId = 'ORD' + (1000 + count).toString();
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Order', orderSchema);