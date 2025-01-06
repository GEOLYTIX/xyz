require('dotenv').config()

const express = require('express')

const cookieParser = require('cookie-parser')

const app = express()

app.use('/xyz', express.static('docs', {
    extensions: ['html']
}))

const env = require('./mapp_env.js');

app.use(`${env.dir || ''}/public`, express.static('public'))

app.use(env.dir || '', express.static('public'))

app.use(`${env.dir || ''}/tests`, express.static('tests'))

app.use(env.dir || '', express.static('tests'))

app.use(cookieParser())

const api = require('./api/api')

app.get(`${env.dir || ''}/api/provider/:provider?`, api)

app.post(`${env.dir || ''}/api/provider/:provider?`, express.json({ limit: '5mb' }), api)

app.get(`${env.dir || ''}/api/sign/:provider?`, api)

app.post(`${env.dir || ''}/api/sign/:provider?`, express.json({ limit: '5mb' }), api)


app.get(`${env.dir || ''}/api/query/:template?`, api)

app.post(`${env.dir || ''}/api/query/:template?`, express.json({ limit: '5mb' }), api)


app.get(`${env.dir || ''}/api/fetch/:template?`, api)

app.post(`${env.dir || ''}/api/fetch/:template?`, express.json({ limit: '5mb' }), api)


app.get(`${env.dir || ''}/api/workspace/:key?`, api)


app.get(`${env.dir || ''}/api/user/:method?/:key?`, api)

app.post(`${env.dir || ''}/api/user/:method?`, [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })], api)

app.get(`${env.dir || ''}/saml/metadata`, api)

app.get(`${env.dir || ''}/saml/logout`, api)

app.get(`${env.dir || ''}/saml/login`, api)

app.post(`${env.dir || ''}/saml/acs`, express.urlencoded({ extended: true }), api)

app.get(`${env.dir || ''}/view/:template?`, api)

app.get(`${env.dir || ''}/:locale?`, api)

env.dir && app.get(`/`, api)

app.listen(env.port || 3000)