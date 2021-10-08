const express = require('express')
const route = express.Router()

const auth = require('../middleware/auth')
const {auth_admin} = require('../middleware/decentralization')
const upload = require('../middleware/upload')
const upload_rar = require('../middleware/upload_rar')

const AdminController = require('../controller/admin.controller')
const UserController = require('../controller/user.controller')

route.get('/', (req, res) => {
    res.render('admin')
})

route.post('/register', UserController.register)
route.post('/previewImg', upload.array('img', 10), AdminController.addPreview)
route.post('/product', upload.single('img'), AdminController.addProduct )
route.post('/category', AdminController.addCategory)
route.patch('/product', AdminController.updateProduct)
route.patch('/category', AdminController.updateCategory)
route.delete('/product', AdminController.removeProduct)
route.delete('/category', AdminController.removeCategory)
route.get('/user', AdminController.getAllUser)
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

module.exports = route