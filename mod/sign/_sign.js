/**
## /sign

The sign API provides access to different request signer modules. Signer modules which are unavailable will export as null and won't be available from the signerModules object methods.

@requires /sign/cloudinary
@requires /sign/s3

@module /sign
*/

const cloudfront = require('./cloudfront')
const cloudinary = require('./cloudinary')
const s3 = require('./s3')

const signerModules = {
  cloudinary,
  s3,
  cloudfront
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
    return res.status(404).send(`Failed to validate 'signer=${req.params.signer}' param.`)
  }

  if (signerModules[req.params.signer] === null) {
    return res.status(405).send(`Signer: ${req.params.signer} is not configured.`)
  }

  const response = await signerModules[req.params.signer](req, res)

  if (response instanceof Error) {

    return res.status(500).send(response.message)
  }
    
  res.send(response)
}
