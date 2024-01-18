const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const bodyParser = require("body-parser");

const encodeUrl = bodyParser.urlencoded({extended: false});

router.post('/login', encodeUrl, userController.loginUser)
router.post('/register', encodeUrl, userController.registerUser)

router.post('/update', encodeUrl, userController.updateUser)
router.post('/delete', encodeUrl, userController.deleteUser)

module.exports = router