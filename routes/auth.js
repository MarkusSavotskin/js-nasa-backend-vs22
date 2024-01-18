const express = require('express')
const router = express.Router()
const userController = require('../controllers/auth')
const bodyParser = require("body-parser");

const encodeUrl = bodyParser.urlencoded({extended: false});

router.post('/auth', encodeUrl, userController.verifyToken)

module.exports = router