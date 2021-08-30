const dotenv = require('dotenv')
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
var cors = require('cors')
const passport = require("passport");
const session = require('express-session');
const flash = require('express-flash')



const app = express()

dotenv.config()

app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

const pathPublic = path.join(__dirname, './public')
app.use(express.static(pathPublic))

// =============== MONGOOSE ==================
mongoose.connect(process.env.URI_DATABASE, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true})

const Product = require('./models/product.model')
const Category = require('./models/category.model')
const PreviewImage = require('./models/previewImage.model')

// =========== SETUP SESSION ========================
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());


// ================ ROUTE ===================
require('./routes/auth')(app, passport)


app.get('/product', async function(req, res) {
    const data = await Product.find({}).populate('previewImage')
    res.status(200).send({count: data.length, entries: data})
})

app.get('/product/:productId', async function(req, res) {
    const productid = req.params.productId
    const data = await Product.find({id: productid})
    res.status(200).send(data)
})

app.post('/product', function(req, res) {

    let newProduct = new Product({
        "id": req.body.id,
        "img": req.body.img,
        "title": req.body.title,
        "rate": req.body.rate,
        "price": req.body.price,
        "description": req.body.description,
        "quantity": req.body.quantity,
        "category": req.body.category
    })

    newProduct.save()
    .then(() => {
        res.status(200).send('successful')
    })
    .catch(e => {
        res.status(200).send('Fail')
    })
})

app.get('/category', async function (req, res) {
    const data = await Category.find({}).populate('products')
    res.status(200).send({count: data.length, entries: data})
})

app.post('/category', function(req, res) {

    let newCategory = new Category({
        "id": req.body.id,
        "products": req.body.products,
        "category": req.body.category
    })

    newCategory.save()
    .then(() => {
        res.status(200).send('successful')
    })
    .catch(e => {
        res.status(200).send('Fail')
    })
})

app.get('/previewImage', async (req, res) => {
    const data = await PreviewImage.find({})
    res.status(200).send(data)
}) 

app.post('/previewImage', async (req, res) => {
    let newPreviewImage = new PreviewImage({
        "src": req.body.src
    })

    newPreviewImage.save()
    .then(() => {
        res.status(200).send('successful')
    })
    .catch(e => {
        res.status(200).send('Fail')
    })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log("Server started on port " + PORT);
});