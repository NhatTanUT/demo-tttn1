const mongoose = require("mongoose")
const Item = require('./item.model.js')
const Product = require('../models/product.model')

var userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        min: 1,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    firstName: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    lastName: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    cart: {
        type: [Item.schema],
        default: []
    },
    wishlist: {
        
    }
})

// methods ======================

module.exports = mongoose.model('User', userSchema);