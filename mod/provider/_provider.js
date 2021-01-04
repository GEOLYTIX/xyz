const github = require('./github')

const cloudfront = require('./cloudfront')

const cloudinary = require('./cloudinary')

module.exports = async (req, res) => {

  const _provider = {
    github: github,
    cloudfront: cloudfront,
    cloudinary: cloudinary
  }

  const provider = _provider[req.params.provider]

  if (!provider) {
    return res.send(`Failed to evaluate 'provider' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/provider/">Provider API</a>`)
  }

  const response = await provider(req)

  req.params.content_type && res.setHeader('content-type', req.params.content_type)

  res.send(response)
}