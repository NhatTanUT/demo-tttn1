const Users = require("../models/user.model");
const Product = require("../models/product.model");
const Category = require("../models/category.model");

const Order = require("../models/order.model");
const Item = require("../models/item.model");

const {
  createAccessToken,
  createRefreshToken,
} = require("../utils/createToken");

const createError = require("http-errors");
const path = require("path");
const mailer = require("../utils/mailer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_KEY);

class UserController {
  async register(req, res, next) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        role,
        gender,
        DOB,
        phonenumber,
      } = req.body;
      // let newEmail = email.toLowerCase() // /g replace remove first element. /g to remove all (purpose: remove space)

      const foundEmail = await Users.findOne({ email: email });
      if (foundEmail)
        return next(createError(400, "This email already registered. "));

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters." });

      const passwordHash = await bcrypt.hash(password, 12);

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
        DOB,
        gender,
        phonenumber,
      });

      const access_token = createAccessToken({ id: newUser._id });
      const refresh_token = createRefreshToken({ id: newUser._id });

      await newUser.save();

      // res.cookie("refresh_token", refresh_token, {
      //   httpOnly: true,
      //   path: "/refresh_token",
      //   maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      // });

      return res.json({
        msg: "Register Success! ",
        access_token,
        refresh_token,
        user: {
          ...newUser._doc,
          password: "",
        },
      });
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email: email });

      if (!user) return next(createError(400, "This email does not exist."));

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return next(createError(400, "Password is incorrect."));

      const access_token = createAccessToken({ id: user._id });
      const refresh_token = createRefreshToken({ id: user._id });

      // res.cookie("refresh_token", refresh_token, {
      //   httpOnly: true,
      //   path: "/refresh_token",
      //   maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
      // });

      return res.json({
        msg: "Login Success!",
        access_token,
        refresh_token,
        user: {
          ...user._doc,
          password: "",
        },
      });
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async logout(req, res, next) {
    try {
      res.clearCookie("refresh_token", { path: "/refresh_token" });
      return res.json({ msg: "Logged out!" });
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async getAccessToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return next(createError(400, "Please login now."));

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) return next(createError(400, "Please login now."));

          const user = await Users.findById(result.id).select("-password");

          if (!user) return next(createError(400, "This does not exist."));

          const access_token = createAccessToken({ id: result.id });

          res.json({
            access_token,
            user,
          });
        }
      );
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async getProducts(req, res, next) {
    const data = await Product.find({});
    return res.json({ count: data.length, entries: data });
  }
  async getProduct(req, res, next) {
    const productid = req.params.productId;
    const data = await Product.find({ id: productid });
    return res.json(data);
  }
  async getCategories(req, res, next) {
    const data = await Category.find({}).populate("products");
    return res.json({ count: data.length, entries: data });
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user._id;
      const password = req.body.password;
      const oldPassword = req.body.oldPassword;

      if (password.length < 6)
        return next(
          createError(400, "Password must be at least 6 characters.")
        );

      const user = await Users.findOne({ _id: userId });

      if (!user) return next(createError(400, "User does not exist."));

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return next(createError(400, "Password is incorrect."));

      const passwordHash = await bcrypt.hash(password, 12);

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
      return next(createError(500, error.message));
    }
  }
  async sendMail(req, res, next) {
    try {
      const { to, subject, body } = req.body;
      await mailer.sendMail(to, subject, body);
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async sendMailOrder(req, res, next) {
    try {
      if (!res.locals.newOrder) console.log("Error");
      const newOrder = res.locals.newOrder;

      const subject = "Checkout Order #" + newOrder._id + " success";
      const to = newOrder.email;

      let body = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
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
                                          OrderNumber: #${newOrder._id}
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
                                                            Billing  Adderss
                                                          </td>
                                                          
                                                      </tr>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 14px; line-height: 18px; color: #666666;">
                                                              Fullname: ${newOrder.firstName} ${newOrder.lastName}
                                                          </td>
                                    
                                                      </tr>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 14px; line-height: 18px; color: #666666;">
                                                              Address: ${newOrder.address}
                                                          </td>
                                                          
                                                      </tr>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 14px; line-height: 18px; color: #666666; padding-bottom: 10px;">
                                                            ${newOrder.city}, ${newOrder.postalCode}
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 14px; line-height: 18px; color: #666666; padding-bottom: 10px;">
                                                            Phonenumber: ${newOrder.phone}
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                      </tr>
                                      <!-- End address Section -->
                                      
                                      <!-- Start product Section -->`;

      for (const el of newOrder.OrderItems) {
        const found = await Product.findOne(
          { _id: mongoose.Types.ObjectId(el.idProduct) },
          "title img"
        );
        body += `<tr>
        <td style="padding-top: 0;">
            <table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="devicewidthinner" style="border-bottom: 1px solid #eeeeee;">
                <tbody>
                <tr>
        <td rowspan="4" style="padding-right: 10px; padding-bottom: 10px;">
            <img style="height: 80px;" src=${found.img} alt="Product Image" />
        </td>
        <td colspan="2" style="font-size: 14px; font-weight: bold; color: #666666; padding-bottom: 5px;">
            ${found.title}
        </td>
    </tr>
    <tr>
        <td style="font-size: 14px; line-height: 18px; color: #757575; width: 440px;">
            Rate: ${el.quantity}
        </td>
        <td style="width: 130px;"></td>
    </tr>
    <tr>
        <td style="font-size: 14px; line-height: 18px; color: #757575;">
            Price: ${el.price}
        </td>
        
    </tr>
    <tr>
        <td style="font-size: 14px; line-height: 18px; color: #757575;">
            <a href="${process.env.HOST_WEB}download/${newOrder.idUser}/${el.idProduct}">Download</a>
        </td>
        
    </tr>
    </tbody>
    </table>
</td>`;
      }

      await mailer.sendMail(to, subject, body);
      // ##############################################
    } catch (error) {
      console.log(error);
      return next(createError(500, error.message));
    }
  }
  async getOrders(req, res, next) {
    try {
      const id = req.user._id;
      const orders = await Order.find({ idUser: id }).lean();

      for(let el of orders) {
        for (let e of el.OrderItems) {
          if (e.percent) {
            e.price = Math.round(e.price * (100 - e.percent) / 100 * 100) / 100;
          }
        }
        el.total = Math.round(el.total * 100) / 100;
      }

      res.json(orders);
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async sendResetPassword(req, res, next) {
    try {
      const { email } = req.body;

      const foundUser = await Users.findOne({ email: email }).lean();
      if (!foundUser) {
        return next(createError(500, "Not found email!"));
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
    } catch (error) {
      console.log(error);
    }
  }
  async addOrder(req, res, next) {
    try {
      let {
        orderItems,
        idUser,
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

      let status = "Unpaid";

      // Check price
      let listProduct = orderItems.map((el) => {
        return el.idProduct;
      });

      let foundPro = await Product.find(
        {
          _id: { $in: listProduct },
        },
        "price title percent"
      );

      // console.log(foundPro);
      let newOrderItems = [];
      for (let el of foundPro) {
        for (let e of orderItems) {
          if (el._id == e.idProduct) {
            e.name = el.title
            e.percent = el.percent
            if (el.price !== e.price) return next(createError(500, 'Incorrect price'))
            newOrderItems.push(e)
          }
        }
      }

      orderItems = newOrderItems

      let total = 0;
      for (let el of orderItems) {
        total += Number(el.price) * Number(el.quantity) * ((100 - Number(el.percent)) / 100)
      }

      let foundDiscount = res.locals.foundDiscount;

      let discount = "";


      // Use discount
      if (foundDiscount) {
        discount = foundDiscount.code;
        total = Math.round((total * (100 - Number(foundDiscount.amount)) / 100) * 100) / 100;
      }

      let field = {
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
      };
      if (idUser === "guest") {
        delete field.idUser;
      }

      const newOrder = new Order({
        ...field,
      });

      newOrder.save();

      if (!newOrder) {
        return next(createError(500, "Cant create order"));
      }

      for (let el of newOrder.OrderItems) {
        let foundProduct = await Product.updateOne(
          { _id: el.idProduct },
          { $inc: { count: 1 } }
        );
        if (foundProduct.modifiedCount !== 1) {
          return next(createError(500, "Cant increase count product"));
        }
      }

      if (newOrder.idUser) {
        let foundUser = await Users.updateOne(
          { _id: newOrder.idUser },
          { $set: { cart: [] } }
        );
      }
      // if (foundUser.modifiedCount !== 1) {}  //chua nhat thiet phai loi

      res.locals.newOrder = newOrder;
      // res.json({ msg: "Add order success", order: newOrder });
      return next();
    } catch (error) {
      console.log(error);
      return next(createError(500, error));
    }
  }
  async getOrders(req, res, next) {
    try {
      const id = req.user._id;
      const orders = await Order.find({ idUser: id }).lean();

      res.json(orders);
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async sendResetPassword(req, res, next) {
    try {
      const { email } = req.body;

      const foundUser = await Users.findOne({ email: email }).lean();
      if (!foundUser) {
        return next(createError(500, "Not found email!"));
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
      return next(createError(500, error.message));
    }
  }
  async resetPassword(req, res, next) {
    const { id, tokenResetPassword } = req.params;
    const { password } = req.body;

    if (password.length < 6)
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters." });

    const foundUser = await Users.findOne({ _id: id });
    if (!foundUser) return next(createError(400, "Not found email. "));

    const user = jwt.verify(
      tokenResetPassword,
      process.env.RESET_TOKEN_SECRET + foundUser.password
    );
    if (!user) return next(createError(401, "Invalid Authentication."));

    const passwordHash = await bcrypt.hash(password, 12);

    await Users.updateOne(
      { _id: user.id },
      { $set: { password: passwordHash } }
    );

    return res.json({ msg: "Reset password success!" });
  }
  async getResetPassword(req, res, next) {
    // var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    // res.render("resetPassword", {link: fullUrl});
    res.render("resetPassword");
  }
  async getCart(req, res, next) {
    try {
      const user = await Users.findOne({ _id: req.user._id })
        .populate("cart.idProduct")
        .lean();

      return res.json({ cart: user.cart });
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async addCart(req, res, next) {
    try {
      const { idProduct, quantity } = req.body;

      const foundUser = await Users.findOne({ _id: req.user._id });

      if (!foundUser) return next(createError(400, "Invalid Authentication."));

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
      return next(createError(500, error.message));
    }
  }
  async removeCart(req, res, next) {
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
      return next(createError(500, error.message));
    }
  }
  async checkout(req, res, next) {
    try {
      let { email, firstName, lastName, number, exp_month, exp_year, cvc } =
        req.body;
      // const id = req.user._id;
      // console.log(res.locals.newOrder);

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
        amount: Math.round((res.locals.newOrder.total * 100) * 100) / 100,
        description: "Order #" + res.locals.newOrder._id,
        currency: "usd",
        source: token.id,
      });

      if (charge.status === "succeeded") {
        const idOrder = res.locals.newOrder._id;
        const foundOrder = await Order.updateOne(
          { _id: mongoose.Types.ObjectId(idOrder) },
          { $set: { status: "Paid" } }
        );

        if (foundOrder.matchedCount === 1) {
          res.json({ msg: "Checkout #" + idOrder + " success" });
        } else res.status(500).json({ msg: "Checkout #" + idOrder + " fail" });
      }

      return next();
    } catch (error) {
      console.log(error);
      return next(createError(500, error.message));
    }
  }
  async changeInfo(req, res, next) {
    try {
      const { firstName, lastName, phonenumber, gender, DOB } = req.body;
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
            firstName,
            lastName,
            phonenumber,
            gender,
            DOB,
          },
        }
      );

      return res.json({
        msg: "Change Info Success",
        user: { _id: id, firstName: firstName, lastName: lastName },
      });
    } catch (error) {
      console.log(error);
      return next(createError(500, error.message));
    }
  }
  async uploadFile(req, res, next) {
    try {
      if (req.file) {
        return res
          .status(200)
          .send({ path: req.file.path, origin: req.file.originalname });
      } else {
        return next(createError(500, "Error"));
      }
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async getInfo(req, res, next) {
    try {
      const id = req.user._id;

      const foundUser = await Users.findOne(
        { _id: mongoose.Types.ObjectId(id) },
        "-password -cart"
      );

      return res.json({ ...foundUser._doc });
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async addWishlist(req, res, next) {
    try {
      const id = req.user._id;
      const { idProduct } = req.body;

      const foundUser = await Users.updateOne(
        { _id: id },
        { $addToSet: { wishlist: idProduct } }
      );
      if (foundUser.modifiedCount === 0) {
        return res
          .status(500)
          .json({ msg: "Product already exists in wishlist", id, idProduct });
      }

      return res.json({ msg: "Add wishlist success", id, idProduct });
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async getWishlist(req, res, next) {
    try {
      const id = req.user._id;
      const foundUser = await Users.findOne({ _id: id }, "wishlist")
        .populate("wishlist")
        .lean();

      return res.json({ ...foundUser });
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async removeWishlist(req, res, next) {
    try {
      const id = req.user._id;
      const { idProduct } = req.body;

      await Users.updateOne(
        { _id: id },
        { $pull: { wishlist: mongoose.Types.ObjectId(idProduct) } }
      );
      return res.json({
        msg: "Remove product from wishlist success",
        id,
        idProduct,
      });
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async getNotification(req, res, next) {
    try {
      const id = req.user._id;
      const foundUser = await Users.findOne(
        { _id: mongoose.Types.ObjectId(id) },
        "notification"
      );

      return res.json({ ...foundUser._doc });
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async downloadSource(req, res, next) {
    try {
      const { idUser, idProduct } = req.params;
      const foundOrder = await Order.findOne({
        idUser: mongoose.Types.ObjectId(idUser),
        "OrderItems.idProduct": mongoose.Types.ObjectId(idProduct),
      });
      if (foundOrder) {
        const foundProduct = await Product.findOne(
          { _id: mongoose.Types.ObjectId(idProduct) },
          "source"
        );
        if (foundProduct) {
          const dir = path.dirname(require.main.filename);
          const filePath = path.join(dir + foundProduct.source);
          const file =
            foundProduct.source.split("/")[
              foundProduct.source.split("/").length - 1
            ];

          return res.download(filePath, file);
        }
      }
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
  async check_Discount(req, res, next) {
    try {
      if (res.locals.foundDiscount) {
        return res.json(res.locals.foundDiscount);
      } else return next(createError(500, "Cant find discount1"));
    } catch (error) {
      return next(createError(500, error.message));
    }
  }
}

module.exports = new UserController();
