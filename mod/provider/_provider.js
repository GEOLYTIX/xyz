/**
@module /provider

@description
Functions for handling 3rd party service provider requests
*/

const file = require('./file')

const cloudfront = require('./cloudfront')

const s3 = require('./s3')

/**
@function provider
@async

@description
The provider method looks up a provider module method matching the provider request parameter and passes the req/res objects as argument to the matched method.

The response from the method is returned with the HTTP response.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params Request parameter.
@param {string} params.signer Provider module to handle the request.

@returns {Promise} The promise resolves into the response from the provider modules method.
*/
module.exports = async function provider(req, res){

  const provider = {
    cloudfront,
    file,
    s3,
  }

  if (!Object.hasOwn(provider, req.params.provider)) {
    return res.send(`Failed to validate 'provider' param.`)
  }

  const response = await provider[req.params.provider](req, res)

  req.params.content_type && res.setHeader('content-type', req.params.content_type)

  res.send(response)
}
