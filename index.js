const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
const cors = require('cors')
const axios = require('axios')

const user = {
    username: 'admin',
    password: 'admin'
}

//openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
//openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt

const options = {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/server.crt')
};

const getRequest = async (url) => {
    const res = await axios.get(url)
    if (res.status !== 200) {
        throw Object.assign(new Error(`${res.status}: ${res.statusText}`))
    }
    return res.data
}
https.createServer(options, app).listen(8081, () => {
    console.log('NSAT backend app listening at https://localhost:8081')
})
/*
const server = app.listen(8081, () => {
    const host = server.address().address
    const port = server.address().port
    console.log(`NASA backend app listening at http://localhost:${port}`)
})
*/
app.use(cors())
app.use(express.json())

app.get('/hello', (req, res) => {
    let data = "Hello world!"
    console.log(data);
    res.send(data);
})

app.post('/login', (req, res) => {
    console.log(req.body)
    if (req.body.username === user.username) {
        if (req.body.password === user.password) {
            res.send({
                status: 200,
                message: 'Authorized'
            })
        }
    } else {
        res.send({
            status: 401,
            message: 'Unauthorized'
        })
    }
})

app.get('/satellites', (req, res) => {
    getRequest('https://tle.ivanstanojevic.me/api/tle/').then(data => {
        console.log(data)
        res.send(data)
    })
})