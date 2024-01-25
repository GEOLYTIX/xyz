const cloudinary = require('./cloudinary')

module.exports = async (req, res) => {

  const platform = {
    cloudinary
  }

  if (!Object.hasOwn(platform, req.params.provider)) {
    return res.send(`Failed to validate 'provider' param.`)
  }

  const response = await platform[req.params.provider](req)

  req.params.content_type && res.setHeader('content-type', req.params.content_type)

  res.send(response)
}