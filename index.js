const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');

app.use(express.static('public'));

// Session middleware
app.use(sessions({
    secret: 'thisismysecrctekey',
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60 * 24}, // 24 hours
    resave: false
}));

app.use(cookieParser());

const options = {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/server.crt')
};

app.use(cors());
app.use(express.json());

https.createServer(options, app).listen(8081, () => {
    console.log('NSAT backend app listening at https://localhost:8081');
});

const userRouter = require('./routes/user')
const tokenRouter = require('./routes/auth')

app.use('/', userRouter)
app.use('/', tokenRouter)
