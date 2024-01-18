const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res) => {
  const token = req.cookies.token

  // if the cookie is not set, return an unauthorized error
  if (!token) {
    res.status(401).send({
      message: "Token not found, log in"
    })
  }

  try {
    // Parse the JWT string and store the result in `payload`.
    // Note that we are passing the key in this method as well. This method will throw an error
    // if the token is invalid (if it has expired according to the expiry time we set on sign in),
    // or if the signature does not match
    const user = jwt.verify(token, config.secret)
    res.status(200).send({
      message: "Token is valid",
      username: user.username,
      email: user.email
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // if the error thrown is because the JWT is unauthorized, return a 401 error
      res.status(401).send({
        message: "Token expired, log in again"
      });
    }
    // otherwise, return a bad request error
    res.status(400).send({
      message: "Something went wrong"
    });
  }
}

module.exports = {
  verifyToken
}