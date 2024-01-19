const cloudinary = require('./cloudinary')

module.exports = async (req, res) => {

  const platform = {
    cloudinary
  }

  if (!Object.hasOwn(platform, req.params.sign)) {
    return res.send(`Failed to validate 'sign' param.`)
  }

  const response = await provider[req.params.sign](req)

  req.params.content_type && res.setHeader('content-type', req.params.content_type)

  res.send(response)
}