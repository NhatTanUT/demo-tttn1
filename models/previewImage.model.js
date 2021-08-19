const mongoose = require('mongoose')

const previewImageSchema = new mongoose.Schema({
    "src": {
        type: String
    }
})

module.exports = new mongoose.model('previewImage', previewImageSchema)