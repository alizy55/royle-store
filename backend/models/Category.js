const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: String,
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    image: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create slug from name before saving
categorySchema.pre('save', function(next) {
    if (this.name && !this.slug) {
        this.slug = this.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);