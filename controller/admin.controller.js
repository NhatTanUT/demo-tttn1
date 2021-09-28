const Users = require("../models/user.model");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const PreviewImage = require("../models/previewImage.model");
const Order = require("../models/order.model");
const Item = require("../models/item.model");
const mailer = require('../utils/mailer')

const mongoose = require("mongoose");

class AdminController {
  async addPreview(req, res) {
    try {
      const { idProduct } = req.body;
      let foundProduct = await Product.findOne({ _id: idProduct });

      req.files.forEach(async (e) => {
        let newPreviewImage = new PreviewImage({
          src: process.env.HOST_WEB + "uploads/" + e.originalname,
        });

        await newPreviewImage.save();
        
        foundProduct.previewImage.push(newPreviewImage._id);
        
        foundProduct.save();

      });
      
      return res.json({
        msg: "Add preview image success",
        idProduct: idProduct,
        previewImg: foundProduct.previewImage,
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
  
      return res.json({ allUser });
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
  async sendMailWishList(req, res) {
    try {
      const {idProduct, price} = req.body
      const subject = "Your wishlist product has changed in price"

      const foundProduct = await Product.findOne({_id: mongoose.Types.ObjectId(idProduct)})

      const body = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
              <title>Email Template for Order Confirmation Email</title>
              
              <!-- Start Common CSS -->
              <style type="text/css">
                  #outlook a {padding:0;}
                  body{width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; font-family: Helvetica, arial, sans-serif;}
                  .ExternalClass {width:100%;}
                  .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;}
                  .backgroundTable {margin:0; padding:0; width:100% !important; line-height: 100% !important;}
                  .main-temp table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family: Helvetica, arial, sans-serif;}
                  .main-temp table td {border-collapse: collapse;}
              </style>
              <!-- End Common CSS -->
          </head>
          <body>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" class="backgroundTable main-temp" style="background-color: #d5d5d5;">
                  <tbody>
                      <tr>
                          <td>
                              <table width="600" align="center" cellpadding="15" cellspacing="0" border="0" class="devicewidth" style="background-color: #ffffff;">
                                  <tbody>
                                      <!-- Start header Section -->
                                      <tr>
                                          <td style="padding-top: 30px;">
                                              <table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="devicewidthinner" style="border-bottom: 1px solid #eeeeee; text-align: center;">
                                                  <tbody>
                                                      <tr>
                                                          <td style="padding-bottom: 10px;">
                                                              <a href="https://htmlcodex.com"><img src="" alt="PapaChina" /></a>
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #666666;">
                                                              3828 Mall Road
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #666666;">
                                                              Los Angeles, California, 90017
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #666666;">
                                                              Phone: 310-807-6672 | Email: info@example.com
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #666666; padding-bottom: 25px;">
                                                              <strong>Order Number:</strong> 001 | <strong>Order Date:</strong> 21-Nov-19
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                      </tr>
                                      <!-- End header Section -->
                                      
                                      <!-- Start address Section -->
                                      <tr>
                                          <td style="padding-top: 0;">
                                              <table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="devicewidthinner" style="border-bottom: 1px solid #bbbbbb;">
                                                  <tbody>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 16px; font-weight: bold; color: #666666; padding-bottom: 5px;">
                                                              Delivery Adderss
                                                          </td>
                                                          <td style="width: 45%; font-size: 16px; font-weight: bold; color: #666666; padding-bottom: 5px;">
                                                              Billing Address
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 14px; line-height: 18px; color: #666666;">
                                                              James C Painter
                                                          </td>
                                                          <td style="width: 45%; font-size: 14px; line-height: 18px; color: #666666;">
                                                              James C Painter
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 14px; line-height: 18px; color: #666666;">
                                                              3939  Charles Street, Farmington Hills
                                                          </td>
                                                          <td style="width: 45%; font-size: 14px; line-height: 18px; color: #666666;">
                                                              3939  Charles Street, Farmington Hills
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 14px; line-height: 18px; color: #666666; padding-bottom: 10px;">
                                                              Michigan, 48335
                                                          </td>
                                                          <td style="width: 45%; font-size: 14px; line-height: 18px; color: #666666; padding-bottom: 10px;">
                                                              Michigan, 48335
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                      </tr>
                                      <!-- End address Section -->
                                      
                                      <!-- Start product Section -->
                                      <tr>
                                          <td style="padding-top: 0;">
                                              <table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="devicewidthinner" style="border-bottom: 1px solid #eeeeee;">
                                                  <tbody>
                                                      <tr>
                                                          <td rowspan="4" style="padding-right: 10px; padding-bottom: 10px;">
                                                              <img style="height: 80px;" src=${foundProduct.img} alt="Product Image" />
                                                          </td>
                                                          <td colspan="2" style="font-size: 14px; font-weight: bold; color: #666666; padding-bottom: 5px;">
                                                              ${foundProduct.title}
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #757575; width: 440px;">
                                                              rate: ${foundProduct.rate}
                                                          </td>
                                                          <td style="width: 130px;"></td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #757575;">
                                                              Description: ${foundProduct.description}
                                                          </td>
                                                          
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #757575; padding-bottom: 10px;">
                                                              Price:
                                                          </td>
                                                          <td style="font-size: 14px; line-height: 18px; color: #757575; text-align: right; padding-bottom: 10px;">
                                                              <b style="color: #666666;">${foundProduct.price}</b> Total
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                      </tr>
                                      
                                      <!-- End product Section -->
                                      
                                      <!-- Start calculation Section -->
                                      
                                      <!-- End calculation Section -->
                                      
                                      <!-- Start payment method Section -->
                                      <tr>
                                          <td style="padding: 0 10px;">
                                              <table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="devicewidthinner">
                                                  <tbody>
                                                      
                                                      <tr>
                                                          <td colspan="2" style="width: 100%; text-align: center; font-style: italic; font-size: 13px; font-weight: 600; color: #666666; padding: 15px 0; border-top: 1px solid #eeeeee;">
                                                              <b style="font-size: 14px;">Note:</b> Shop bán theme và template siêu cấp vip pro :v
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                      </tr>
                                      <!-- End payment method Section -->
                                  </tbody>
                              </table>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </body>
      </html>`
      
      const foundWishlist = await Users.find({wishlist: mongoose.Types.ObjectId(idProduct)}, 'email')

      Promise.all(
        foundWishlist.map(async (user) => {
          await mailer.sendMail(user.email, subject, body);      
        })
      )
      
      return res.json({msg: "Send Mail WishList", foundWishlist, foundProduct})
    } catch (error) {
      return res.status(500).json({ msg: error });
      
    }
  }
}

module.exports = new AdminController();
