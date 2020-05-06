const dotenv = require('dotenv');
dotenv.config();

const express = require('express')

const bodyParser = require('body-parser')

const cookieParser = require('cookie-parser')

const app = express()

app.use(process.env.DIR||'', express.static('public'))

app.use(cookieParser())

const proxy = require('express-http-proxy');

app.use(`${process.env.DIR || ''}/api/proxy`, proxy(
    req => req.query.host,
    {
        https: true,
        proxyReqPathResolver: req => {

            //console.log(`${encodeURIComponent(req.query.uri)}&${process.env[`KEY_${req.query.provider.toUpperCase()}`]}`)
            return `${req.query.uri}&${process.env[`KEY_${req.query.provider.toUpperCase()}`]}`

        }
    }))


app.get(`${process.env.DIR||''}/view/:template?/:access?`, (req, res) => require('./api/view')(req, res))

app.get(`${process.env.DIR||''}/:access?`, (req, res) => require('./api/view')(req, res))


app.get(`${process.env.DIR||''}/api/provider/:provider?`, (req, res) => require('./api/provider')(req, res))

app.post(`${process.env.DIR||''}/api/provider/:provider?`, bodyParser.json({limit: '5mb'}), (req, res) => require('./api/provider')(req, res))


app.get(`${process.env.DIR||''}/api/query/:template?`, (req, res) => require('./api/query')(req, res))

app.post(`${process.env.DIR||''}/api/query/:template?`, bodyParser.json({limit: '5mb'}), (req, res) => require('./api/query')(req, res))


app.get(`${process.env.DIR||''}/api/gazetteer`, (req, res) => require('./api/gazetteer')(req, res))


app.get(`${process.env.DIR||''}/api/workspace/:method?/:key?`, (req, res) => require('./api/workspace')(req, res))

app.post(`${process.env.DIR||''}/api/workspace/:method?/:key?`, bodyParser.json({limit: '5mb'}), (req, res) => require('./api/workspace')(req, res))


app.get(`${process.env.DIR||''}/api/layer/:format?/:z?/:x?/:y?`, (req, res) => require('./api/layer')(req, res))


app.get(`${process.env.DIR||''}/api/location/:method?`, (req, res) => require('./api/location')(req, res))

app.post(`${process.env.DIR||''}/api/location/:method?`, bodyParser.json({limit: '5mb'}), (req, res) => require('./api/location')(req, res))


app.get(`${process.env.DIR||''}/api/user/:method?/:key?`, (req, res) => require('./api/user')(req, res))

app.post(`${process.env.DIR||''}/api/user/:method?/:key?`, bodyParser.urlencoded({extended: true}), (req, res) => require('./api/user')(req, res))


app.listen(process.env.PORT || 3000)