const Users = require("../models/user.model");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const PreviewImage = require("../models/previewImage.model");
const Order = require("../models/order.model");
const Item = require("../models/item.model");

const mongoose = require("mongoose");

class AdminController {
  async addPreview(req, res) {
    try {
      const { idProduct } = req.body;
      let list = [];
      req.files.forEach(async (e) => {
        let newPreviewImage = new PreviewImage({
          src: process.env.HOST_WEB + "uploads/" + e.originalname,
        });

        await newPreviewImage.save();

        list.push(mongoose.Types.ObjectId(newPreviewImage._id));
      });

      let foundProduct = await Product.findOne({ _id: idProduct });

      foundProduct.previewImage = foundProduct.previewImage.concat(list);

      foundProduct.save();

      return res.json({
        msg: "Add preview image success",
        idProduct: idProduct,
        previewImg: list,
      });
    } catch (error) {
      return res.status(500).json({ msg: error });
    }
  }

  async addProduct(req, res) {
    try {
      let newProduct = new Product({
        id: req.body.id,
        img: process.env.HOST_WEB + "uploads/" + req.file.filename,
        title: req.body.title,
        rate: req.body.rate,
        price: req.body.price,
        description: req.body.description,
        quantity: req.body.quantity,
        category: req.body.category,
      });
      await newProduct.save();
      return res.json({msg: 'Add product success', product: newProduct})
    } catch (error) {
      return res.status(500).json({ msg: error });
    }
  }

  async addCategory(req, res) {
    try {
      let newCategory = new Category({
        id: req.body.id,
        products: req.body.products,
        category: req.body.category,
      });

      newCategory.save();
    } catch (error) {
      return res.status(500).json({ msg: error });
    }
  }
  async updateProduct(req, res) {
    try {
      const idProduct = req.params.idProduct
      const update = req.body
      
      const foundProduct = await Product.updateOne({_id: mongoose.Types.ObjectId(idProduct)}, {$set: update})
      
      return res.json({msg: "Update product success", idProduct, update})
    } catch (error) {
      return res.status(500).json({ msg: error });
    }
  }
  async updateCategory(req, res) {
    try {
      const {idCategory} = req.params
      const update = req.body

      await Product.updateOne({_id: mongoose.Types.ObjectId(idCategory)}, {$set: update})
      
      return res.json({msg: "Update category success", idCategory, update})
    } catch (error) {
      return res.status(500).json({ msg: error });
    }
  }
  async getAllUser(req, res) {
    try {
      const allUser = await Users.find({}, "-password -cart")

      return res.json({ ...allUser._doc });
    } catch (error) {
      return res.status(500).json({ msg: error });
    }
  }
  async getAllOrder(req, res) {
    try {
      const allOrder = await Order.find({})

      return res.json({...allOrder._doc})
    } catch (error) {
      return res.status(500).json({ msg: error });
    }
  }
}

module.exports = new AdminController();
