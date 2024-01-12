const bcrypt = require("bcrypt");
const mysql = require('mysql2');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qwerty',
    database: 'nsat'
});

// TODO: ORM

const verifyToken = (req, res) => {
    // TODO: Tokeni kontrollimine
}

const loginUser = (req, res) => {
    var userName = req.body.username;
    var password = req.body.password;
    console.log(userName, password)

    con.connect(function (err) {
        if (err) {
            console.log(err);
        }
        con.query(`SELECT *
                   FROM users
                   WHERE username = '${userName}'`, function (err, result) {
            if (err) {
                console.log(err);
            }
            // TODO: Kui on mitu samanimelist kontot, paneb kood siin pange. Registreerimisel kontrollida, kas kasutaja on juba olemas.
            if (result.length === 1) {
                const storedHash = result[0].password;

                // Compare the provided password with the stored hash using bcrypt
                bcrypt.compare(password, storedHash, function (err, bcryptResult) {
                    if (err) {
                        console.log(err);
                    } else if (bcryptResult) {
                        // Passwords match, user is authenticated
                        function userPage() {
                            // Create a session for the dashboard (user page) and save user data
                            req.session.user = {
                                // email: email,  // Removed this so login confirmation would work
                                username: userName,
                                password: storedHash // Save the hashed password for consistency
                            };

                            //res.send(req.session.user);
                            res.status(200).send({
                                message: "User logged in",
                                session: req.session.user
                            });
                        }

                        userPage();
                    } else {
                        // Passwords do not match, login failed
                        res.status(401).send({
                            message: "Unauthorized"
                        });
                    }
                });
            } else {
                // User not found, login failed
                res.status(404).send({
                    message: "User not found"
                });
            }
        });
    });
}
// TODO: Registreerimisel kontrollida, kas kasutaja on juba olemas. Kui on mitu samanimelist kontot, paneb kood sisselogimisel pange.
const registerUser = (req, res) => {
    var userName = req.body.username;
    var password = req.body.password;
    var email = req.body.email;

    con.connect(function (err) {
        if (err) {
            console.log(err);
        }
        // checking user already registered or no
        con.query(`SELECT *
                   FROM users
                   WHERE username = '${userName}'
                     AND password = '${password}'`, function (err, result) {
            if (err) {
                console.log(err);
            }
            if (Object.keys(result).length > 0) {
                res.sendFile(__dirname + '/failReg.html');
            } else {
                //creating user page in userPage function
                function userPage() {
                    // We create a session for the dashboard (user page) page and save the user data to this session:
                    req.session.user = {
                        username: userName,
                        password: password,
                        email: email
                    };

                    res.status(200).send({
                            message: "User successfully created"
                        }
                    )
                };

                // inserting new user data
                // Generate a salt and hash the password
                bcrypt.hash(password, 10, function (err, hash) {
                    if (err) {
                        console.log(err);
                        // Handle error appropriately
                    } else {
                        // Insert the user with the hashed password into the database
                        var sql = `INSERT INTO users (username, password, email)
                                   VALUES ('${userName}', '${hash}', '${email}')`;
                        con.query(sql, function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                // Call userPage() after successful registration

                                userPage();
                            }
                        });
                    }
                });

            }

        });
    });
}

const updateUser = (req, res) => {
    // TODO: Kasutaja andmete muutmine
}

const deleteUser = (req, res) => {
    // TODO: Kasutaja kustutamine
}

module.exports = {
    verifyToken,
    loginUser,
    registerUser,
    updateUser,
    deleteUser
}