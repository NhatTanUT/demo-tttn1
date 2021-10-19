const express = require('express');
const route = express.Router();

const UserController = require('../controller/user.controller');
const auth = require('../middleware/auth')
const {auth_role} = require('../middleware/decentralization')
const upload = require('../middleware/upload')
const checkDiscount = require('../middleware/checkDiscount')

route.get('/', (req, res) => {
    res.render('client')
})

route.post('/register', UserController.register);
route.post('/login', UserController.login);
route.post('/logout', UserController.logout);
route.post('/refresh_token', UserController.getAccessToken); 
route.post('/changePassword', auth, auth_role(['user']), UserController.changePassword);
route.get('/product', UserController.getProducts);
route.get('/product/:productId', UserController.getProduct)
route.get('/category', UserController.getCategories)
// route.get('/previewImage', UserController.getPreviewImage)
route.post('/addOrder', checkDiscount, UserController.addOrder, UserController.checkout/*, UserController.sendMailOrder*/);
route.get('/order', auth, auth_role(['user']), UserController.getOrders)
route.post('/resetPassword', UserController.sendResetPassword)
route.get('/resetPassword/:id/:tokenResetPassword', UserController.getResetPassword)
route.post('/resetPassword/:id/:tokenResetPassword', UserController.resetPassword)
route.get('/cart', auth, auth_role(['user']),UserController.getCart)
route.post('/addCart', auth, auth_role(['user']), UserController.addCart)
route.post('/removeCart', auth, auth_role(['user']), UserController.removeCart)
route.post('/checkout', auth, auth_role(['user']), UserController.checkout)
route.post('/changeInfo', auth, auth_role(['user']), UserController.changeInfo)
route.get('/getInfo', auth, auth_role(['user']), UserController.getInfo)
route.post('/upload', upload.single('img'), UserController.uploadFile)
route.post('/addWishlist', auth, auth_role(['user']), UserController.addWishlist)
route.get('/wishlist', auth, auth_role(['user']), UserController.getWishlist)
route.post('/removeWishlist', auth, auth_role(['user']), UserController.removeWishlist)
route.get('/notification', auth, auth_role(['user']), UserController.getNotification)
route.get('/download/:idUser/:idProduct', UserController.downloadSource)
route.post('/checkDiscount', checkDiscount, UserController.check_Discount)

module.exports = route;