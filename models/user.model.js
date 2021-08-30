const mongoose = require("mongoose")
const bcrypt = require('bcrypt')

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
    }  
})

// methods ======================
// // phương thực sinh chuỗi hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
// kiểm tra password có hợp lệ không
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);