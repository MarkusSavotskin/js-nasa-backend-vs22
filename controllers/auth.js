const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res) => {
    const token = req.cookies.token

    // if the cookie is not set, return an unauthorized error
    if (!token) {
        return res.status(401).end()
    }

    try {
        // Parse the JWT string and store the result in `payload`.
        // Note that we are passing the key in this method as well. This method will throw an error
        // if the token is invalid (if it has expired according to the expiry time we set on sign in),
        // or if the signature does not match
        const payload = jwt.verify(token, config.secret)
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            // if the error thrown is because the JWT is unauthorized, return a 401 error
            return res.status(401).send({
                message: "Token expired"
            });
        }
        // otherwise, return a bad request error
        return res.status(400).send({
            message: "Something went wrong"
        });
    }
}

module.exports = {
    verifyToken
}