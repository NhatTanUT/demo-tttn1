const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Product = require("./product.model");
const User = require("./user.model");

var orderSchema = mongoose.Schema({
  OrderItems: [
    {
      id_product: {
        type: mongoose.Types.ObjectId,
        ref: Product,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    required: true,
    default: "Paid",
  },
  idUser: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: User,
  },
  Datetime: {
    type: Date,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  discount: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  apartment: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
