/**
@module /sign
*/

const cloudinary = require('./cloudinary')
const firebase = require('./firebase')

module.exports = async (req, res) => {

  const signer = {
    cloudinary,
    firebase
  }

  if (!Object.hasOwn(signer, req.params.provider)) {
    return res.send(`Failed to validate 'provider' param.`)
  }

  const response = await signer[req.params.provider](req)

  req.params.content_type && res.setHeader('content-type', req.params.content_type)

  res.send(response)
}