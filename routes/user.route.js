const express = require('express');
const router = express.Router();

const UserController = require('../controller/user.controller');
const auth = require('../middleware/auth')

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.post('/refresh_token', UserController.getAccessToken); 
router.post('/changePassword', auth, UserController.changePassword);
router.get('/product', UserController.getProducts);
router.get('/product:productId', UserController.getProduct)
router.get('/category', UserController.getCategories)
router.get('/previewImage', UserController.getPreviewImage)
router.post('/addOrder', UserController.addOrder);
router.get('/order', UserController.getOrders)
router.post('/resetPassword', UserController.sendResetPassword)
router.post('/resetPassword/:id/:tokenResetPassword', UserController.resetPassword)

module.exports = router;