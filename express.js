const dotenv = require('dotenv')

dotenv.config()

const express = require('express')

const cookieParser = require('cookie-parser')

const cors = require('cors');

const app = express()

app.use(process.env.DIR||'', express.static('public'))

app.use(`/xyz/docs`, express.static('docs'))

app.use(cookieParser())
app.use(cors());


const _api = require('./api/api')

const api = (req, res) => _api(req, res)


app.get(`${process.env.DIR||''}/api/proxy`, api)


app.get(`${process.env.DIR||''}/api/provider/:provider?`, api)

app.post(`${process.env.DIR||''}/api/provider/:provider?`, express.json({limit: '5mb'}), api)


app.get(`${process.env.DIR||''}/api/query/:template?`, api)

app.post(`${process.env.DIR||''}/api/query/:template?`, express.json({limit: '5mb'}), api)


app.get(`${process.env.DIR||''}/api/gazetteer`, api)


app.get(`${process.env.DIR||''}/api/workspace/get/:key?`, api)


app.get(`${process.env.DIR||''}/api/layer/:format?/:z?/:x?/:y?`, api)


app.get(`${process.env.DIR||''}/api/location/:method?`, api)

app.post(`${process.env.DIR||''}/api/location/:method?`, express.json({limit: '5mb'}), api)


app.get(`${process.env.DIR||''}/api/user/:method?/:key?`, api)

app.post(`${process.env.DIR||''}/api/user/:method?/:key?`, express.urlencoded({extended: true}), api)

//sudo ./caddy_linux_amd64 reverse-proxy --from localhost:443 --to localhost:3000
app.get(`${process.env.DIR||''}/auth0/logout`, api)

app.get(`${process.env.DIR||''}/auth0/login`, api)

app.get(`${process.env.DIR||''}/auth0/callback`, api)

app.get(`${process.env.DIR||''}/view/:template?`, api)

app.get(`${process.env.DIR||''}/`, api)

app.get(`${process.env.DIR||''}/ping`, (req, res) => res.json({ works: true }))

process.env.DIR && app.get(`/`, api)

app.listen(process.env.PORT || 3000)