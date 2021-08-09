const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')

const app = express()

dotenv.config()

app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.urlencoded({extended: true}))
app.use(express.json())

const pathPublic = path.join(__dirname, './public')
app.use(express.static(pathPublic))

// =============== MONGOOSE ==================
mongoose.connect(process.env.URI_DATABASE, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true})

const Product = require('./models/product.model')

app.get('/product', async function(req, res) {
    const data = await Product.find({})
    res.status(200).send(data)
})

app.get('/product/:productId', async function(req, res) {
    const productid = req.params.productId
    const data = await Product.find({id: productid})
    res.status(200).send(data)
})

app.post('/', function(req, res) {

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log("Server started on port " + PORT);
});