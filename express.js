require('dotenv').config()

const express = require('express')

const cookieParser = require('cookie-parser')

const app = express()

app.use('/docs', express.static('docs', {
    extensions: ['html']
}))

app.use(`${process.env.DIR||''}/public`, express.static('public'))

app.use(process.env.DIR||'', express.static('public'))

app.use(cookieParser())

const _api = require('./api/api')

const api = (req, res) => _api(req, res)


app.get(`${process.env.DIR||''}/api/provider/:provider?`, api)

app.post(`${process.env.DIR||''}/api/provider/:provider?`, express.json({limit: '5mb'}), api)

app.get(`${process.env.DIR||''}/api/sign/:provider?`, api)

app.post(`${process.env.DIR||''}/api/sign/:provider?`, express.json({limit: '5mb'}), api)


app.get(`${process.env.DIR||''}/api/query/:template?`, api)

app.post(`${process.env.DIR||''}/api/query/:template?`, express.json({limit: '5mb'}), api)


app.get(`${process.env.DIR||''}/api/fetch/:template?`, api)

app.post(`${process.env.DIR||''}/api/fetch/:template?`, express.json({limit: '5mb'}), api)


app.get(`${process.env.DIR||''}/api/workspace/:key?`, api)


app.get(`${process.env.DIR||''}/api/user/:method?`, api)

// this route allows to update user data with payload but is in conflict with the one below
app.post(`${process.env.DIR||''}/api/user/:method?`, express.json({limit: '5mb'}), api)

//sudo ./caddy_linux_amd64 reverse-proxy --from localhost:443 --to localhost:3000

app.get(`${process.env.DIR||''}/saml/metadata`, api)

app.get(`${process.env.DIR||''}/saml/logout`, api)

app.get(`${process.env.DIR||''}/saml/login`, api)

app.post(`${process.env.DIR||''}/saml/acs`, express.urlencoded({extended: true}), api)

app.get(`${process.env.DIR||''}/view/:template?`, api)

app.get(`${process.env.DIR||''}/:locale?`, api)

process.env.DIR && app.get(`/`, api)

app.listen(process.env.PORT || 3000)