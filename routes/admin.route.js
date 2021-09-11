// admin
// app.post('/product', function(req, res) {

//     let newProduct = new Product({
//         "id": req.body.id,
//         "img": req.body.img,
//         "title": req.body.title,
//         "rate": req.body.rate,
//         "price": req.body.price,
//         "description": req.body.description,
//         "quantity": req.body.quantity,
//         "category": req.body.category
//     })

//     newProduct.save()
//     .then(() => {
//         res.status(200).send('successful')
//     })
//     .catch(e => {
//         res.status(200).send('Fail')
//     })
// })

// admin
// app.post('/category', function(req, res) {

//     let newCategory = new Category({
//         "id": req.body.id,
//         "products": req.body.products,
//         "category": req.body.category
//     })

//     newCategory.save()
//     .then(() => {
//         res.status(200).send('successful')
//     })
//     .catch(e => {
//         res.status(200).send('Fail')
//     })
// })

// admin
// app.post('/previewImage', async (req, res) => {
//     let newPreviewImage = new PreviewImage({
//         "src": req.body.src
//     })

//     newPreviewImage.save()
//     .then(() => {
//         res.status(200).send('successful')
//     })
//     .catch(e => {
//         res.status(200).send('Fail')
//     })
// })