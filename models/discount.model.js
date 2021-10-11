const mongoose = require("mongoose");
const Product = require("./product.model");

var discountSchema = mongoose.Schema({
  startDate: {
    type: Date,
    require: true,
  },
  expireDate: {
    type: Date,
    require: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    require: true,
    default: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

discountSchema.pre("save", function (next) {
  var currentDate = new Date();
  this.startDate = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

module.exports = mongoose.model("Discount", discountSchema);
