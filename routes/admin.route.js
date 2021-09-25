const express = require('express')
const route = express.Router()

const auth = require('../middleware/auth')
const {auth_admin} = require('../middleware/decentralization')
const upload = require('../middleware/upload')

const AdminController = require('../controller/admin.controller')
const UserController = require('../controller/user.controller')

route.get('/', auth, auth_admin, (req, res) => {
    res.render('admin')
})

route.post('/register', auth, auth_admin, UserController.register)
route.post('/previewImg', auth, auth_admin, upload.array('img', 10), AdminController.addPreview)
route.post('/product', auth, auth_admin, upload.single('img'), AdminController.addProduct )
route.post('/category', auth, auth_admin, AdminController.addCategory)
route.post('/product/:idProduct', auth, auth_admin, AdminController.updateProduct)
route.post('/category/:idCategory', auth, auth_admin, AdminController.updateCategory)
route.get('/user', auth, auth_admin, AdminController.getAllUser)


module.exports = route