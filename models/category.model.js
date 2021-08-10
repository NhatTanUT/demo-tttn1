const mongoose = require('mongoose')
const Product = require('./product.model')

const categorySchema = new mongoose.Schema({
    "id": {
        type: String,
        required: true
    },
    "products": [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Product
    }],
    "category": {
        type: String
    }
})

module.exports = new mongoose.model('Category', categorySchema)