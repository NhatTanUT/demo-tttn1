const mongoose = require("mongoose");
const Item = require("./item.model.js");
const Product = require("../models/product.model");

var userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    min: 1,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    min: 1,
    max: 255,
  },
  firstName: {
    type: String,
    required: true,
    min: 1,
    max: 255,
  },
  lastName: {
    type: String,
    required: true,
    min: 1,
    max: 255,
  },
  status: {
    type: String,
    required: true,
    default: "active",
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unknown'],
  },
  DOB: {
    type: Date
  },
  phonenumber: {
    type: String,
    min: 1, 
    max: 12,
  },
  cart: {
    type: [Item.schema],
    default: [],
  },
  role: {
    type: String,
    required: true,
  },
  wishlist: {
    type: [mongoose.Types.ObjectId],
    required: true,
    ref: Product,
    default: [],
  },
  notification: {}
});

// methods ======================

module.exports = mongoose.model("User", userSchema);
