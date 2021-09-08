const express = require('express');
const router = express.Router();

const UserController = require('../controller/user.controller');
const auth = require('../middleware/auth')

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.post('/refresh_token', UserController.getAccessToken);

module.exports = router;