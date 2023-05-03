const https = require('https')

const proxies = {
    isoline_here: 'router.hereapi.com/v8/isolines'
}

module.exports = (req, res) => {

  if (!Object.hasOwn(proxies, req.params.proxy)) return;

  // Find variables to be substituted.
  const url_params = req.params.params?.replace(/\{{1}(.+?)\}{1}/g,

    // Substitute matched variable with key value from process environment.
    matched => process.env[`KEY_${matched.replace(/\{{1}|\}{1}/g, '')}`] || matched)

  const proxy = https.request(`https://${proxies[req.params.proxy]}?${url_params}`, _res => {
    res.writeHead(_res.statusCode, _res.headers)
    _res.pipe(res, {
      end: true
    })
  })

  req.pipe(proxy, {
    end: true
  })
  
}