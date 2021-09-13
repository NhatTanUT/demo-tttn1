const Users = require("../models/user.model");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const PreviewImage = require("../models/previewImage.model");
const Order = require("../models/order.model");
const mailer = require("../utils/mailer");
const brcypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

class UserController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;
      // let newEmail = email.toLowerCase() // /g replace remove first element. /g to remove all (purpose: remove space)

      const foundEmail = await Users.findOne({ email: email });
      if (foundEmail)
        res.status(400).json({ msg: "This email already registered. " });

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters." });

      const passwordHash = await brcypt.hash(password, 12);

      const newUser = new Users({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: passwordHash,
      });

      const access_token = createAccessToken({ id: newUser._id });
      const refresh_token = createRefreshToken({ id: newUser._id });

      await newUser.save();

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        path: "/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.json({
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

      res.json({
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

      console.log(orderItems);

      const newOrder = new Order({
        OrderItems: orderItems,
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
      });

      await newOrder.save();

      return res.json({ msg: "Add order success", order: newOrder });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async getOrders(req, res) {
    try {
      const orders = await Order.find().lean();

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
      const body = `<h3>Link reset password. Link có hiệu lực trong vòng 15 phút</h3><p>Link:</p> <p>${link}</p>`;

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
