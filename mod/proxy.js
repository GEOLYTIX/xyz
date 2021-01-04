const https = require('https')

module.exports = (req, res) => {

  const _url = req.url.match(/\?.*/)

  if (!_url[0]) return

  // Find variables to be substituted.
  const url = _url[0].substring(1).replace(/\$\{(.*?)\}/g,

    // Substitute matched variable with key value from process environment.
    matched => process.env[`KEY_${matched.replace(/\$|\{|\}/g, '')}`] || matched)

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