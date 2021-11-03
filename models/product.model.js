const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    "id": {
        type: String,
        required: true,
        unique: true
    },
    "img": {
        type: String
    },
    "title": {
        type: String
    },
    "rate": {
        type: String
    },
    "price": {
        type: Number
    },
    "description": {
        type: String
    },
    "quantity": {
        type: Number
    },
    "category": {
        type: String
    },
    "previewImage": [{
        type: String
    }],
    "ventor": {
        type: String
    },
    "source": {
        type: String
    },
    "count": {
        type: Number,
        default: 0
    },
    "percent": {
        type: Number,
        default: 0
    },
    "livePreview": {
        type: String
    },
    "quickFact": [{
        type: Array
    }]
})

module.exports = new mongoose.model('Product', productSchema)