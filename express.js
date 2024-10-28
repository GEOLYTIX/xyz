require('dotenv').config()

const express = require('express')

const cookieParser = require('cookie-parser')

const app = express()

app.use('/xyz', express.static('docs', {
    extensions: ['html']
}))

app.use(`${process.env.DIR || ''}/public`, express.static('public'))

app.use(process.env.DIR || '', express.static('public'))

app.use(`${process.env.DIR || ''}/tests`, express.static('tests'))

app.use(process.env.DIR || '', express.static('tests'))

app.use(cookieParser())

const api = require('./api/api')

app.get(`${process.env.DIR || ''}/api/provider/:provider?`, api)

app.post(`${process.env.DIR || ''}/api/provider/:provider?`, express.json({ limit: '5mb' }), api)

app.get(`${process.env.DIR || ''}/api/sign/:provider?`, api)

app.post(`${process.env.DIR || ''}/api/sign/:provider?`, express.json({ limit: '5mb' }), api)


app.get(`${process.env.DIR || ''}/api/query/:template?`, api)

app.post(`${process.env.DIR || ''}/api/query/:template?`, express.json({ limit: '5mb' }), api)


app.get(`${process.env.DIR || ''}/api/fetch/:template?`, api)

app.post(`${process.env.DIR || ''}/api/fetch/:template?`, express.json({ limit: '5mb' }), api)


app.get(`${process.env.DIR || ''}/api/workspace/:key?`, api)


app.get(`${process.env.DIR || ''}/api/user/:method?/:key?`, api)

app.post(`${process.env.DIR || ''}/api/user/:method?`, [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })], api)

app.get(`${process.env.DIR || ''}/saml/metadata`, api)

app.get(`${process.env.DIR || ''}/saml/logout`, api)

app.get(`${process.env.DIR || ''}/saml/login`, api)

app.post(`${process.env.DIR || ''}/saml/acs`, express.urlencoded({ extended: true }), api)

app.get(`${process.env.DIR || ''}/view/:template?`, api)

app.get(`${process.env.DIR || ''}/:locale?`, api)

process.env.DIR && app.get(`/`, api)

app.listen(process.env.PORT || 3000)