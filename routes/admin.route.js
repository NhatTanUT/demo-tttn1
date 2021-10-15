const express = require('express')
const route = express.Router()

const auth = require('../middleware/auth')
const {auth_role} = require('../middleware/decentralization')
const upload = require('../middleware/upload')
const upload_rar = require('../middleware/upload_rar')

const AdminController = require('../controller/admin.controller')

route.get('/', auth, auth_role(['admin']), (req, res) => {
    res.render('admin')
})

const uploadMultiple = upload.fields([{ name: 'img', maxCount: 1 }, { name: 'previewImage', maxCount: 6 }])


route.post('/register', AdminController.register, AdminController.sendMailRegister)
route.post('/product', uploadMultiple, AdminController.addProduct )
route.post('/category', AdminController.addCategory)
route.patch('/product', uploadMultiple, AdminController.updateProduct)
route.patch('/category', AdminController.updateCategory)
route.delete('/product', AdminController.removeProduct)
route.delete('/category', AdminController.removeCategory)
route.get('/user', AdminController.getAllUser)
route.post('/user', AdminController.addUser)
route.patch('/user', AdminController.updateUser)
route.delete('/user', AdminController.deleteUser)
route.get('/order', AdminController.getAllOrder)
route.delete('/order', AdminController.removeOrder)
route.post('/sendMailWishlist', AdminController.sendMailWishList)
route.post('/sendPromotion', AdminController.sendPromotion)
route.get('/clientOnline', AdminController.getAllClientOnline)
route.post('/notify', AdminController.sendNotification)
route.post('/notify_banner', AdminController.sendNotificationBanner)
// route.post('/removeNotify', AdminController.removeNotify)
route.post('/uploadrar', upload_rar.single('file'), AdminController.uploadRar)
route.post('/discount', AdminController.addDiscount)
route.get('/discount', AdminController.getDiscount)
route.patch('/discount', AdminController.updateDiscount)
route.delete('/discount', AdminController.removeDiscount)

module.exports = route