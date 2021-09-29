const mongoose = require("mongoose")

var itemSchema = mongoose.Schema({
    content: {
        type: String
    },
    Date: {
        type: Date
    }
})

// methods ======================

module.exports = mongoose.model('ItemNotification', itemSchema);