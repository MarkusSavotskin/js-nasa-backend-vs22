const bcrypt = require('bcrypt');

const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const jwtExpirySeconds = 300;

const Sequelize = require('sequelize');
const {Op} = require("sequelize");

const models = require('../models')

const loginUser = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await models.User.findOne({
            where: {
                username: username
            }
        });

        if (user) {
            const storedHash = user.password;

            // Compare the provided password with the stored hash using bcrypt
            bcrypt.compare(password, storedHash, function (err, bcryptResult) {
                if (err) {
                    console.log(err);
                } else if (bcryptResult) {
                    // Passwords match, user is authenticated
                    const loggedInUser = {
                        username: username,
                        password: storedHash
                    }

                    const token = jwt.sign({ loggedInUser }, config.secret, {
                        algorithm: "HS256",
                        expiresIn: jwtExpirySeconds,
                    })

                    console.log("User logged in successfully\n" + JSON.stringify(user));
                    res.status(200).cookie("token", token, { maxAge: jwtExpirySeconds * 1000 }).send({
                        message: "User logged in successfully"
                    })
                } else {
                    // Passwords do not match, login failed
                    res.status(401).send({
                        message: "Incorrect password"
                    });
                }
            })
        } else {
            // User not found, login failed
            res.status(404).send({
                message: "Username does not exist"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
}

const registerUser = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    let usernameIsOk = false;
    let emailIsOk = false;

    try {
        const users = await models.User.findAll({
            where: {
                username: username
            }
        });

        if (users.length === 0) {
            usernameIsOk = true;
        }

        const emails = await models.User.findAll({
            where: {
                email: email
            }
        });

        if (emails.length === 0) {
            emailIsOk = true;
        }

        if (usernameIsOk && emailIsOk) {
            bcrypt.hash(password, 10, async (err, hash) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send(err.message);
                }

                try {
                    const user = await models.User.create({
                        username: username,
                        password: hash,
                        email: email,
                        reg_date: new Date()
                    });

                    console.log("User registration successful\n" + JSON.stringify(user));
                    res.send({
                        message: "User registration successful",
                        user: user
                    });
                } catch (error) {
                    console.error(error);
                    res.status(500).send(error.message);
                }
            });
        } else {
            res.status(409).send({
                message: "Username or email already exists",
                usernameIsOk: usernameIsOk,
                emailIsOk: emailIsOk
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
}

const updateUser = (req, res) => {
    // TODO: Kasutaja andmete muutmine
}

const deleteUser = (req, res) => {
    // TODO: Kasutaja kustutamine
}

module.exports = {
    loginUser,
    registerUser,
    updateUser,
    deleteUser
}