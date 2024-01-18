const bcrypt = require('bcrypt');

const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const jwtExpirySeconds = 300;

const Sequelize = require('sequelize');
const {Op} = require("sequelize");

const models = require('../models')
const {hashPassword} = require("mysql/lib/protocol/Auth");

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
      bcrypt.compare(password, storedHash, (err, bcryptResult) => {
        if (err) {
          console.log(err);
        } else if (bcryptResult) {

          // Passwords match, token is created and user is authenticated
          const token = jwt.sign({
            username: user.username,
            password: storedHash,
            email: user.email
          }, config.secret, {
            algorithm: "HS256",
            expiresIn: jwtExpirySeconds,
          })

          console.log("User logged in successfully\n" + JSON.stringify(user));
          res.status(200).cookie("token", token, {maxAge: jwtExpirySeconds * 1000}).send({
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

  let hashedPassword;
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

    try {
      hashedPassword = await bcrypt.hash(password, 10)
    } catch (error) {
      console.log(error)
      res.status(400).send({
        message: "Something went wrong"
      });
    }

    if (usernameIsOk && emailIsOk) {

      try {
        const user = await models.User.create({
          username: username,
          password: hashedPassword,
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

const updateUser = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  let newUsername = req.body.newUsername;
  let newPassword = req.body.newPassword;
  let newEmail = req.body.newEmail;

  let hashedPassword;

  let usernameIsOk = false;
  let emailIsOk = false;

  try {
    if (newUsername) {
      const users = await models.User.findAll({
        where: {
          username: newUsername
        }
      });

      if (users.length === 0) {
        usernameIsOk = true;
      }
    } else {
      usernameIsOk = true;
      newUsername = username;
    }

    if (newEmail) {
      const emails = await models.User.findAll({
        where: {
          email: newEmail
        }
      });

      if (emails.length === 0) {
        emailIsOk = true;
      }
    } else {
      emailIsOk = true;
      newEmail = email;
    }

    if (newPassword) {
      try {
        console.log(newPassword)
        hashedPassword = await bcrypt.hash(newPassword, 10)
        console.log(hashedPassword)
      } catch (error) {
        console.log(error)
        res.status(400).send({
          message: "Something went wrong"
        });
      }
    } else {
      hashedPassword = password;
    }

    if (usernameIsOk && emailIsOk) {

      try {
        const user = await models.User.findOne({
          where: {
            username: username
          }
        });

        console.log(user)
        if (user) {

          await user.update({
            username: newUsername,
            password: hashedPassword,
            email: newEmail
          })

          console.log("User data successfully updated\n" + JSON.stringify(user));
          res.send({
            message: "User data successfully updated",
            user: user
          });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
      }
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

const deleteUser = (req, res) => {
  // TODO: Kasutaja kustutamine
}

module.exports = {
  loginUser,
  registerUser,
  updateUser,
  deleteUser
}