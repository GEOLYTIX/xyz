const file = require('./file')

const cloudfront = require('./cloudfront')

const cloudinary = require('./cloudinary')

module.exports = async (req, res) => {

  const _provider = {
    cloudfront: cloudfront,
    cloudinary: cloudinary,
    file: file,
  }

  const provider = _provider[req.params.provider]

  if (!provider) {
    return res.send(`Failed to evaluate 'provider' param.`)
  }

  const response = await provider(req)

  req.params.content_type && res.setHeader('content-type', req.params.content_type)

  res.send(response)
}