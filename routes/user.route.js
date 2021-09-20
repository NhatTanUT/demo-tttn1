const express = require('express');
const route = express.Router();

const UserController = require('../controller/user.controller');
const auth = require('../middleware/auth')

route.post('/register', UserController.register);
route.post('/login', UserController.login);
route.post('/logout', UserController.logout);
route.post('/refresh_token', UserController.getAccessToken); 
route.post('/changePassword', auth, UserController.changePassword);
route.get('/product', UserController.getProducts);
route.get('/product:productId', UserController.getProduct)
route.get('/category', UserController.getCategories)
route.get('/previewImage', UserController.getPreviewImage)
route.post('/addOrder', UserController.addOrder);
route.get('/order', auth, UserController.getOrders)
route.post('/resetPassword', UserController.sendResetPassword)
route.get('/resetPassword/:id/:tokenResetPassword', UserController.getResetPassword)
route.post('/resetPassword/:id/:tokenResetPassword', UserController.resetPassword)
route.get('/cart', auth, UserController.getCart)
route.post('/addCart', auth, UserController.addCart)
route.post('/removeCart', auth, UserController.removeCart)
route.post('/checkout', auth, UserController.checkout)
route.post('/changeInfo', auth, UserController.changeInfo)

module.exports = route;