const express = require('express')

const proxy = require('express-http-proxy')

const app = express()

app.use('/', proxy(
  req => req.query.host,
  {
    https: true,
    proxyReqPathResolver: req => `${req.query.uri}&${process.env[`KEY_${req.query.provider.toUpperCase()}`]}`
  }))

module.exports = app