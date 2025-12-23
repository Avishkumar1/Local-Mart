const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
    userId: {
        type: Number,
        unique: true,
    },
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: false
    },
    Phone: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    Address: {
        type: String,
        required: false
    },
    City: {
        type: String,
        required: false,
        trim: true
    },
    DOB: {
        type: Date,
        required: false
    },
    Gender: {
        type: String,
        required: false
    }
    ,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // [longitude, latitude]
        }
    },
    role: {
        type: String,
        enum: ['Customer', 'Shopkeeper', 'DeliveryPartner'],
        default: 'Customer'
    },
    IsAvailable: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

userSchema.plugin(AutoIncrement, { inc_field: 'userId' });



module.exports = mongoose.model("User", userSchema);

