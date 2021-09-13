const mongoose = require("mongoose")
const Product = require('./product.model')

var itemSchema = mongoose.Schema({
    idProduct: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: Product
    },
    quantity: {
        type: Number,
        required: true
    }
})

// methods ======================

module.exports = mongoose.model('Item', itemSchema);