/**
## /sign

The sign module provides access to different request signer methods.

@requires /sign/cloudinary

@module /sign
*/

const cloudinary = require('./cloudinary')
const s3 = require('./s3')

const signerModules = {
  cloudinary,
  s3
}

/**
@function signer
@async

@description
The signer method looks up a signerModules method matching the signer request parameter and passes the req/res objects as argument to the matched method.

The response from the method is returned with the HTTP response.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params Request parameter.
@param {string} params.signer Signer module to sign the request.

@returns {Promise} The promise resolves into the response from the signerModules method.
*/
module.exports = async function signer(req, res) {

  if (!Object.hasOwn(signerModules, req.params.signer)) {
    return res.send(`Failed to validate 'provider' param.`)
  }

  const response = await signerModules[req.params.signer](req, res)

  if (response instanceof Error) {

    return res.status(500).send(response.message)
  }
    
  res.send(response)
}
