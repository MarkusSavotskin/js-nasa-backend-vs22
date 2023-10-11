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

https.createServer(options, app).listen(8082, () => {
  console.log('NSAT backend app listening at https://localhost:8082');
});

app.get('/hello', (req, res) => {
  const data = 'Hello world!';
  console.log(data);
  res.send(data);
});

app.post('/login', encodeUrl, (req, res) => {
  const { userName, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ?';
  con.execute(sql, [userName], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }

    if (result.length === 1) {
      const storedHash = result[0].password;

      bcrypt.compare(password, storedHash, (err, bcryptResult) => {
        if (err) {
          console.log(err);
          return;
        }

        if (bcryptResult) {
          req.session.user = {
            email: result[0].email,
            username: userName,
            password: storedHash
          };

          res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Dashboard</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
                <div class="container">
                    <h3>Hi, ${req.session.user.username} ${req.session.user.email}</h3>
                    <a href="/">Log out</a>
                </div>
            </body>
            </html>
          `);
        }
      });
    }
  });
});

app.post('/register', encodeUrl, (req, res) => {
  const { email, username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  con.execute(query, [username], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }

    if (result.length === 0) {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.log(err);
          return;
        }

        const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
        con.execute(sql, [username, hash, email], (err, result) => {
          if (err) {
            console.log(err);
          }
          // You may want to send a success response here.
        });
      });
    } else {
      // You may want to send a "user already exists" response here.
    }
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
