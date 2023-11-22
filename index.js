const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const mysql = require('mysql2');

const encodeUrl = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

// Session middleware
app.use(sessions({
  secret: 'thisismysecrctekey',
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
  resave: false
}));

app.use(cookieParser());

// MySQL Connection
const con = mysql.createConnection({
  host: 'localhost',
  user: 'Sanks',
  password: 'qwerty',
  database: 'login'
});

con.connect(function(err) {
  if (err) console.log(err);
});

const options = {
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/server.crt')
};

app.use(cors());
app.use(express.json());

https.createServer(options, app).listen(8081, () => {
  console.log('NSAT backend app listening at https://localhost:8081');
});

app.post('/register', encodeUrl, (req, res) => {
  var userName = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  con.connect(function(err) {
    if (err){
      console.log(err);
    }
    // checking user already registered or no
    con.query(`SELECT * FROM users WHERE username = '${userName}' AND password  = '${password}'`, function(err, result){
      if(err){
        console.log(err);
      }
      if(Object.keys(result).length > 0){
        res.sendFile(__dirname + '/failReg.html');
      }else{
        //creating user page in userPage function
        function userPage(){
          // We create a session for the dashboard (user page) page and save the user data to this session:
          req.session.user = {
            username: userName,
            password: password,
            email: email
          };

          res.send(
              {status: "ok"}
        )};

        // inserting new user data
        // Generate a salt and hash the password
        bcrypt.hash(password, 10, function(err, hash) {
          if (err) {
            console.log(err);
            // Handle error appropriately
          } else {
            // Insert the user with the hashed password into the database
            var sql = `INSERT INTO users (username, password, email) VALUES ('${userName}', '${hash}', '${email}')`;
            con.query(sql, function (err, result) {
              if (err){
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


});

app.post("/login", encodeUrl, (req, res) => {
  var userName = req.body.username;
  var password = req.body.password;
  console.log(userName, password)

  con.connect(function (err) {
    if (err) {
      console.log(err);
    }
    con.query(`SELECT * FROM users WHERE username = '${userName}'`, function (err, result) {
      if (err) {
        console.log(err);
      }

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
              res.send({
                status: "OK"
              });
            }

            userPage();
          } else {
            // Passwords do not match, login failed
            res.send("Unauthorized");
          }
        });
      } else {
        // User not found, login failed
        res.send("User not found");
      }
    });
  });
});

app.get('/satellites', (req, res) => {
  axios.get('https://tle.ivanstanojevic.me/api/tle/')
      .then(response => {
        console.log(response.data);
        res.send(response.data);
      })
      .catch(error => {
        console.log(error);
      });
});
