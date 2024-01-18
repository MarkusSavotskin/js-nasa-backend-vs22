const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')
const bodyParser = require("body-parser");

const encodeUrl = bodyParser.urlencoded({extended: false});

router.get('/auth', encodeUrl, authController.verifyToken)

module.exports = router