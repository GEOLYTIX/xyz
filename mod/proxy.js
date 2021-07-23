const logger = require('./logger')

const https = require('https')

module.exports = (req, res) => {

  if (!req.params.url) return

  // Find variables to be substituted.
  const url = decodeURIComponent(req.params.url).replace(/\{(.*?)\}/g,

    // Substitute matched variable with key value from process environment.
    matched => process.env[`KEY_${matched.replace(/\{|\}/g, '')}`] || matched)


  logger(url, 'proxy')

  const proxy = https.request(url, _res => {
    res.writeHead(_res.statusCode, _res.headers)
    _res.pipe(res, {
      end: true
    })
  })

  req.pipe(proxy, {
    end: true
  })
  
}