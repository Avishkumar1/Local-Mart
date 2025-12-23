const mongoose = require('mongoose');

const ShopItemSchema = new mongoose.Schema({
    shopkeeperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    images: [{
        type: String
    }],
    category: {
        type: String,
        required: false,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ShopItem', ShopItemSchema);
