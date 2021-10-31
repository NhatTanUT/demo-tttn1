const { ObjectId } = require('bson')
const mongoose = require('mongoose')
const { array } = require('../middleware/upload')

let accessLogSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: new Date()
    },
    list: {
        type: Array,
        required: true,
        default: []
    }
})

module.exports = new mongoose.model('AccessLog', accessLogSchema)