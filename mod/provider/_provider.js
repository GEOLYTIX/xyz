/**
@module /provider

@description
Functions for handling 3rd party service provider requests
*/

import cloudfront from './cloudfront.js';
import file from './file.js';

import s3 from './s3.js';

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
export default async function provider(req, res) {
  const provider = {
    cloudfront,
    file,
    s3,
  };

  if (!Object.hasOwn(provider, req.params.provider)) {
    return res
      .status(404)
      .send(`Failed to validate 'provider=${req.params.provider}' param.`);
  }

  if (provider[req.params.provider] === null) {
    return res
      .status(405)
      .send(`Provider: ${req.params.provider} is not configured.`);
  }

  const response = await provider[req.params.provider](req, res);

  req.params.content_type &&
    res.setHeader('content-type', req.params.content_type);

  res.send(response);
}
