const file = require('./file')

const cloudfront = require('./cloudfront')

const cloudinary = require('./cloudinary')

const s3 = require('./s3')

module.exports = async (req, res) => {

  const provider = {
    cloudfront: cloudfront,
    cloudinary: cloudinary,
    file: file,
    s3: s3
  }

  if (!Object.hasOwn(provider, req.params.provider)) {
    return res.send(`Failed to validate 'provider' param.`)
  }

  const response = await provider[req.params.provider](req)

  req.params.content_type && res.setHeader('content-type', req.params.content_type)

  res.send(response)
}