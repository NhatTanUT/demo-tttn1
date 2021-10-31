const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    percent: {
        type: Number
    }
})

module.exports = new mongoose.model('Banner', bannerSchema)