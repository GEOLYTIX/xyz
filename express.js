const dotenv = require('dotenv');
dotenv.config();

const express = require('express')

const bodyParser = require('body-parser')

const cookieParser = require('cookie-parser')

const app = express()

app.use(process.env.DIR||'', express.static('public'))

app.use(`/xyz/docs`, express.static('docs'))

app.use(cookieParser())


const _api = require('./api')

const api = (req, res) => _api(req, res)


app.get(`${process.env.DIR||''}/view/:template?/:access?`, api)

app.get(`${process.env.DIR||''}/:access?`, api)


app.get(`${process.env.DIR||''}/api/proxy`, api)


app.get(`${process.env.DIR||''}/api/provider/:provider?`, api)

app.post(`${process.env.DIR||''}/api/provider/:provider?`, bodyParser.json({limit: '5mb'}), api)


app.get(`${process.env.DIR||''}/api/query/:template?`, api)

app.post(`${process.env.DIR||''}/api/query/:template?`, bodyParser.json({limit: '5mb'}), api)


app.get(`${process.env.DIR||''}/api/gazetteer`, api)


app.get(`${process.env.DIR||''}/api/workspace/:method?/:key?`, api)

app.post(`${process.env.DIR||''}/api/workspace/:method?/:key?`, bodyParser.json({limit: '5mb'}), api)


app.get(`${process.env.DIR||''}/api/layer/:format?/:z?/:x?/:y?`, api)


app.get(`${process.env.DIR||''}/api/location/:method?`, api)

app.post(`${process.env.DIR||''}/api/location/:method?`, bodyParser.json({limit: '5mb'}), api)


app.get(`${process.env.DIR||''}/api/user/:method?/:key?`, api)

app.post(`${process.env.DIR||''}/api/user/:method?/:key?`, bodyParser.urlencoded({extended: true}), api)


app.listen(process.env.PORT || 3000)