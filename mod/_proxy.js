const https = require('https')

module.exports = (req, res) => {

  if (!Object.hasOwn(process.env, `PROXY_${req.params.proxy}`)) {
    console.warn('Missing Proxy Key!')
    return;
  }

  // Find variables to be substituted.
  const url_params = req.params.params?.replace(/\{{1}(.+?)\}{1}/g,

    // Substitute matched variable with key value from process environment.
    matched => process.env[`KEY_${matched.replace(/\{{1}|\}{1}/g, '')}`] || matched)

  const proxy = https.request(`https://${process.env[`PROXY_${req.params.proxy}`]}?${url_params}`, _res => {
    res.writeHead(_res.statusCode, _res.headers)
    _res.pipe(res, {
      end: true
    })
  })

  req.pipe(proxy, {
    end: true
  })

}