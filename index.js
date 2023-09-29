const express = require('express');
const app = express();
const cors = require('cors')
const axios = require('axios')

app.use(cors())
app.use(express.json())

app.get('/hello', (req, res) => {
    let data = "Hello world!"
    console.log(data);
    res.send(data);
})

app.get('/satellites', (req, res) => {
    getRequest('https://tle.ivanstanojevic.me/api/tle/').then(data => {
        console.log(data)
        res.send(data)
    })
})

const getRequest = async (url) => {
    const res = await axios.get(url)
    if (res.status !== 200) {
        throw Object.assign(new Error(`${res.status}: ${res.statusText}`))
    }
    return res.data
}

const server = app.listen(8081, () => {
    const host = server.address().address
    const port = server.address().port
    console.log(`Example app listening at http://localhost:${port}, ${host}, ${port}`)
})