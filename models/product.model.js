const mongoose = require('mongoose')
const PreviewImage = require('./previewImage.model')

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
    }
})

module.exports = new mongoose.model('Product', productSchema)