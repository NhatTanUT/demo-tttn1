const userModel = require("../models/user.model")

const router = require("express").Router()

module.exports = function (app, passport) {

    // Redirect route login
    app.get("/", (req, res) => {
        res.redirect("http://localhost:8080/login")
    })

    // Get login
    app.get("/login", checkNotAuthenticated, (req, res) => {
        res.redirect('http://localhost:8080/')
    })

    // app.post('/login', checkNotAuthenticated, (req, res) => {
    //     const email = req.body.email
    //     const pass = req.body.password
    //     res.send({'email': email, 'password': pass})
    // })

    // app.post('/resgiter', (req, res) => {
    //     const email = req.body.email
    //     const pass = req.body.password
    //     const firstName = req.body.firstName
    //     const lastName = req.body.lastName
    //     res.send({'email': email, 'password': pass, 'firstName': firstName, 'lastName': lastName})
    // })


    // Post Login
    app.post('/login', checkNotAuthenticated, passport.authenticate("local-login", {
        successRedirect: 'http://localhost:8080/',
        failureRedirect: 'http://localhost:8080/login',
        failureFlash: true
    }));

    // Post Register
    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: 'http://localhost:8080/', // chuyển hướng tới trang được bảo vệ
        failureRedirect: 'http://localhost:8080/register', // trở lại trang đăng ký nếu có lỗi
        failureFlash: true // allow flash messages
    }));

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    })

}


// Check authenticate admin
function checkAuthenticated_admin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === "admin") {
        return next()
    }

    res.redirect('/login')
}

// Check authenticate user
function checkAuthenticated_user(req, res, next) {
    if (req.isAuthenticated() && req.user.role === "teacher") {
        return next()
    }

    res.redirect('/login')
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/account')
    }
    next()
}