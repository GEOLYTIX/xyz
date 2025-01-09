require('dotenv').config()

const express = require('express')

const cookieParser = require('cookie-parser')

const app = express()

app.use('/xyz', express.static('docs', {
    extensions: ['html']
}))

const env = require('./mod/utils/processEnv.js');

app.use(`${env.DIR}/public`, express.static('public'))

app.use(env.DIR, express.static('public'))

app.use(`${env.DIR}/tests`, express.static('tests'))

app.use(env.DIR, express.static('tests'))

app.use(cookieParser())

const api = require('./api/api')

app.get(`${env.DIR}/api/provider/:provider?`, api)

app.post(`${env.DIR}/api/provider/:provider?`, express.json({ limit: '5mb' }), api)


app.get(`${env.DIR || ''}/api/sign/:signer?`, api)


app.get(`${env.DIR}/api/query/:template?`, api)

app.post(`${env.DIR}/api/query/:template?`, express.json({ limit: '5mb' }), api)


app.get(`${env.DIR}/api/fetch/:template?`, api)

app.post(`${env.DIR}/api/fetch/:template?`, express.json({ limit: '5mb' }), api)


app.get(`${env.DIR}/api/workspace/:key?`, api)


app.get(`${env.DIR}/api/user/:method?/:key?`, api)

app.post(`${env.DIR}/api/user/:method?`, [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })], api)

app.get(`${env.DIR}/saml/metadata`, api)

app.get(`${env.DIR}/saml/logout`, api)

app.get(`${env.DIR}/saml/login`, api)

app.post(`${env.DIR}/saml/acs`, express.urlencoded({ extended: true }), api)

app.get(`${env.DIR}/view/:template?`, api)

app.get(`${env.DIR}/:locale?`, api)

app.get(`/`, api)

app.listen(env.PORT)