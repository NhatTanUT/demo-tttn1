const Users = require("../models/user.model");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const PreviewImage = require("../models/previewImage.model");
const Order = require("../models/order.model");
const Item = require("../models/item.model");

const mailer = require("../utils/mailer");
const brcypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(
  "sk_test_51JaOiqBB6mnd2pw6z9xto29ShDJFpBgLgJydIJaHX31NegJQb2v7z9929mDyP1Lfd0ksL7qYj26du4KUnvcgntb900V5kC318H"
);

class UserController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      // let newEmail = email.toLowerCase() // /g replace remove first element. /g to remove all (purpose: remove space)

      const foundEmail = await Users.findOne({ email: email });
      if (foundEmail)
        return res.status(400).json({ msg: "This email already registered. " });

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters." });

      const passwordHash = await brcypt.hash(password, 12);

      let role1 = "user";
      if (req.user) {
        if (req.user.role === "admin") {
          if (role) {
            role1 = role;
          }
        }
      }

      const newUser = new Users({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: passwordHash,
        role: role1,
      });

      const access_token = createAccessToken({ id: newUser._id });
      const refresh_token = createRefreshToken({ id: newUser._id });

      await newUser.save();

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        path: "/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.json({
        msg: "Register Success! ",
        access_token,
        user: {
          ...newUser._doc,
          password: "",
        },
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email: email });

      if (!user)
        return res.status(400).json({ msg: "This email does not exist." });

      const isMatch = await brcypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect." });

      const access_token = createAccessToken({ id: user._id });
      const refresh_token = createRefreshToken({ id: user._id });

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        path: "/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
      });

      return res.json({
        msg: "Login Success!",
        access_token,
        user: {
          ...user._doc,
          password: "",
        },
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async logout(req, res) {
    try {
      res.clearCookie("refresh_token", { path: "/refresh_token" });
      return res.json({ msg: "Logged out!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async getAccessToken(req, res) {
    try {
      const refresh_token = req.cookies.refresh_token;
      if (!refresh_token)
        return res.status(400).json({ msg: "Please login now." });

      jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) return res.status(400).json({ msg: "Please login now." });

          const user = await Users.findById(result.id).select("-password");

          if (!user)
            return res.status(400).json({ msg: "This does not exist." });

          const access_token = createAccessToken({ id: result.id });

          res.json({
            access_token,
            user,
          });
        }
      );
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async getProducts(req, res) {
    const data = await Product.find({}).populate("previewImage");
    return res.json({ count: data.length, entries: data });
  }
  async getProduct(req, res) {
    const productid = req.params.productId;
    const data = await Product.find({ id: productid });
    return res.json(data);
  }
  async getCategories(req, res) {
    const data = await Category.find({}).populate("products");
    return res.json({ count: data.length, entries: data });
  }
  async getPreviewImage(req, res) {
    const data = await PreviewImage.find({});
    return res.json(data);
  }
  async changePassword(req, res) {
    try {
      const userId = req.user._id;
      const password = req.body.password;

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters." });

      const passwordHash = await brcypt.hash(password, 12);

      await Users.updateOne(
        {
          _id: userId,
        },
        {
          $set: {
            password: passwordHash,
          },
        }
      );

      return res.json({ msg: "Change password success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async sendMail(req, res) {
    try {
      const { to, subject, body } = req.body;
      await mailer.sendMail(to, subject, body);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async addOrder(req, res) {
    try {
      const {
        orderItems,
        status,
        idUser,
        Datetime,
        total,
        discount,
        email,
        firstName,
        lastName,
        company,
        address,
        apartment,
        city,
        country,
        postalCode,
        phone,
      } = req.body;

      const newOrder = new Order({
        OrderItems: orderItems,
        status,
        idUser,
        Datetime: Date(),
        total,
        discount,
        email,
        firstName,
        lastName,
        company,
        address,
        apartment,
        city,
        country,
        postalCode,
        phone,
      });

      await newOrder.save();

      return res.json({ msg: "Add order success", order: newOrder });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async getOrders(req, res) {
    try {
      const id = req.user._id;
      const orders = await Order.find({ idUser: id }).lean();

      res.json(orders);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async sendResetPassword(req, res) {
    try {
      const { email } = req.body;

      const foundUser = await Users.findOne({ email: email }).lean();
      if (!foundUser) {
        return res.status(500).json({ msg: "Not found email!" });
      }

      const secret = process.env.RESET_TOKEN_SECRET + foundUser.password;
      const payload = {
        email: foundUser.email,
        id: foundUser._id,
      };

      const token = jwt.sign(payload, secret, { expiresIn: "15m" });

      const link =
        process.env.HOST_WEB + "resetPassword/" + foundUser._id + "/" + token;

      const to = foundUser.email;
      const subject = "Reset password";
      const body = `
      <!doctype html>
      <html lang="en-US">
      
      <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
          <title>Reset Password Email Template</title>
          <meta name="description" content="Reset Password Email Template.">
          <style type="text/css">
              a:hover {text-decoration: underline !important;}
          </style>
      </head>
      
      <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
          <!--100% body table-->
          <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
              style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
              <tr>
                  <td>
                      <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                          align="center" cellpadding="0" cellspacing="0">
                          <tr>
                              <td style="height:80px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td style="text-align:center;">
                                <a href="https://web-demo.online" title="logo" target="_blank">
                                  <i class="fas fa-fire"></i>
                                </a>
                              </td>
                          </tr>
                          <tr>
                              <td style="height:20px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td>
                                  <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                      style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                      <tr>
                                          <td style="height:40px;">&nbsp;</td>
                                      </tr>
                                      <tr>
                                          <td style="padding:0 35px;">
                                              <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                                  requested to reset your password</h1>
                                              <span
                                                  style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                  We cannot simply send you your old password. A unique link to reset your
                                                  password has been generated for you. To reset your password, click the
                                                  following link and follow the instructions.
                                              </p>
                                              <a href="${link}"
                                                  style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                                  Password</a>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="height:40px;">&nbsp;</td>
                                      </tr>
                                  </table>
                              </td>
                          <tr>
                              <td style="height:20px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td style="text-align:center;">
                                  <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>No Copyright@2021</strong></p>
                              </td>
                          </tr>
                          <tr>
                              <td style="height:80px;">&nbsp;</td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
          <!--/100% body table-->
      </body>
      
      </html>`;

      await mailer.sendMail(to, subject, body);
      return res.json({ msg: "Link reset was sent to email!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async resetPassword(req, res) {
    const { id, tokenResetPassword } = req.params;
    const { password } = req.body;

    if (password.length < 6)
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters." });

    const foundUser = await Users.findOne({ _id: id });
    if (!foundUser) return res.status(400).json({ msg: "Not found email. " });

    const user = jwt.verify(
      tokenResetPassword,
      process.env.RESET_TOKEN_SECRET + foundUser.password
    );
    if (!user) return res.status(401).json({ msg: "Invalid Authentication." });

    const passwordHash = await brcypt.hash(password, 12);

    await Users.updateOne(
      { _id: user.id },
      { $set: { password: passwordHash } }
    );

    return res.json({ msg: "Reset password success!" });
  }
  async getResetPassword(req, res) {
    // var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    // res.render("resetPassword", {link: fullUrl});
    res.render("resetPassword");
  }
  async getCart(req, res) {
    try {
      const user = await Users.findOne({ _id: req.user._id })
        .populate("cart.idProduct")
        .lean();

      return res.json({ cart: user.cart });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async addCart(req, res) {
    try {
      const { idProduct, quantity } = req.body;

      const foundUser = await Users.findOne({ _id: req.user._id });

      if (!foundUser)
        return res.status(400).json({ msg: "Invalid Authentication." });

      const cart = foundUser.cart;

      let change = false;
      for (let i = 0; i < foundUser.cart.length; i++) {
        if (foundUser.cart[i].idProduct.toString() === idProduct) {
          foundUser.cart[i].quantity =
            foundUser.cart[i].quantity + parseFloat(quantity);
          change = true;
        }
      }

      if (change === false) {
        const newItem = new Item({
          idProduct: mongoose.Types.ObjectId(idProduct),
          quantity,
        });
        foundUser.cart.push(newItem);
      }

      await foundUser.save();

      const addProduct = await Product.findOne(
        { _id: mongoose.Types.ObjectId(idProduct) },
        "img title price"
      ).lean();

      return res.json({
        msg: "Add cart success!",
        idProduct: addProduct,
        quantity,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async removeCart(req, res) {
    try {
      const { idProduct } = req.body;
      const id = req.user._id;
      const foundUser = await Users.updateOne(
        {
          _id: id,
        },
        {
          $pull: {
            cart: {
              idProduct: idProduct,
            },
          },
        }
      );

      return res.json({ msg: "Remove item from cart success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async checkout(req, res) {
    try {
      const {
        email,
        firstName,
        lastName,
        amount,
        number,
        exp_month,
        exp_year,
        cvc,
        company,
        address,
        apartment,
        city,
        country,
        postalCode,
        phone,
      } = req.body;
      const id = req.user._id;

      const customer = await stripe.customers.create({
        email: email,
        name: firstName + " " + lastName,
      });

      let param = {};
      param.card = {
        number,
        exp_month,
        exp_year,
        cvc,
      };

      let token = await stripe.tokens.create(param);

      const addCard = await stripe.customers.createSource(customer.id, {
        source: token.id,
      });

      token = await stripe.tokens.create(param);

      const charge = await stripe.charges.create({
        amount,
        description: "test",
        currency: "usd",
        source: token.id,
      });
      console.log(charge);
      return res.json({ msg: "Success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async changeInfo(req, res) {
    try {
      const { firstName, lastName } = req.body;
      const id = req.user._id;

      if (firstName === "" || lastName === "") {
        return res
          .status(500)
          .json({ msg: "Firstname or lastname not be empty" });
      }

      const foundUser = await Users.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        {
          $set: {
            firstName: firstName,
            lastName: lastName,
          },
        }
      );

      return res.json({
        msg: "Change Info Success",
        user: { _id: id, firstName: firstName, lastName: lastName },
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async uploadFile(req, res) {
    try {
      if (req.file) {
        return res
          .status(200)
          .send({ path: req.file.path, origin: req.file.originalname });
      } else {
        return res.status(500).json({ msg: "Error" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async getInfo(req, res) {
    try {
      const id = req.user._id;

      const foundUser = await Users.findOne(
        { _id: mongoose.Types.ObjectId(id) },
        "-password -cart"
      );

      return res.json({ ...foundUser._doc });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async addWishlist(req, res) {
    try {
      const id = req.user._id
      const {idProduct} = req.body

      await Users.updateOne({_id: id}, {$push: {wishlist: idProduct}})
      return res.json({msg: 'Add wishlist success', id, idProduct})
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async getWishlist(req, res) {
    try {
      const id = req.user._id
      const foundUser = await Users.findOne({_id: id}, 'wishlist').populate('wishlist')
      console.log(foundUser);
      return res.json({...foundUser._doc})
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
}

function createAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
}

function createRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
}

module.exports = new UserController();
