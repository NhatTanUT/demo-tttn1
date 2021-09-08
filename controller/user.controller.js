const Users = require('../models/user.model');
const brcypt = require('bcrypt')
const jwt = require('jsonwebtoken')

class UserController {
    async register(req, res) {
        try {
            const { email, password, firstName, lastName} = req.body;
            // let newEmail = email.toLowerCase() // /g replace remove first element. /g to remove all (purpose: remove space)

            const foundEmail = await Users.findOne({email: email});
            if (foundEmail) res.status(400).json({msg: "This email already registered. "});

            if (password.length < 6)
                return res.status(400).json({ msg: "Password must be at least 6 characters." })

            const passwordHash = await brcypt.hash(password, 12)

            const newUser = new Users({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: passwordHash
            })

            const access_token = createAccessToken({id: newUser._id})
            const refresh_token = createRefreshToken({id: newUser._id})

            await newUser.save()

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                path: '/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            })

            res.json({
                msg: 'Register Success! ',
                access_token,
                user: {
                    ...newUser._doc,
                    password: ''
                }
            })
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    }
    async login(req, res) {
        try {
            const { email, password} = req.body

            const user = await Users.findOne({email: email})

            if (!user) return res.status(400).json({ msg: "This email does not exist." })

            const isMatch = await brcypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: "Password is incorrect." })

            const access_token = createAccessToken({ id: user._id })
            const refresh_token = createRefreshToken({ id: user._id })

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                path: '/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
            })

            res.json({
                msg: 'Login Success!',
                access_token,
                user: {
                    ...user._doc,
                    password: ''
                }
            })
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    }
    async logout(req, res) {
        try {
            res.clearCookie('refresh_token', {path: '/refresh_token'})
            return res.json({ msg: "Logged out!" })
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    }
    async getAccessToken(req, res) {
        try {
            const refresh_token = req.cookies.refresh_token;
            if (!refresh_token) return res.status(400).json({ msg: "Please login now." })

            jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, async (err, result) => {
                if (err) return res.status(400).json({ msg: "Please login now." })

                const user = await Users.findById(result.id).select("-password")

                if (!user) return res.status(400).json({ msg: "This does not exist." })

                const access_token = createAccessToken({ id: result.id })

                res.json({
                    access_token,
                    user
                })
            })
        } catch (error) {
            return res.status(500).json({ msg: error.message });       
        }
    }
}

function createAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

function createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
}

module.exports = new UserController();