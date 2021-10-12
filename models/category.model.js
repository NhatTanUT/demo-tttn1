const mongoose = require('mongoose')
const Product = require('./product.model')

const categorySchema = new mongoose.Schema({
    "products": [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Product
    }],
    "name": {
        type: String
    }
})

module.exports = new mongoose.model('Category', categorySchema)