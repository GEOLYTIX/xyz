/**
## /provider

The provider module imports the cloudinary, file, and s3 provider modules and exports a provider method that looks up a provider module method matching the provider request parameter and passes the req/res objects as argument to the matched method.

@requires /cloudinary
@requires /file
@requires /s3

@module /provider
*/

import cloudfront from './cloudfront.js';
import file from './file.js';
import s3 from './s3.js';

const providerModules = {
  cloudfront,
  file,
  s3,
};
const allowedContentTypes = new Set(['application/json', 'text/plain']);

/**
@function provider
@async

@description
The provider method looks up a provider module method matching the provider request parameter and passes the req/res objects as argument to the matched method.

The response from the method is parsed as JSON if the response is an object.

The default content type is `text/plain` but can be overridden by the `content_type` request parameter if the value is in the allowed content types list.

The content type is derived from the requested resource if the URL ends with a JavaScript extension.

@param {req} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params Request parameter.
@param {string} params.provider Provider module to handle the request.

@returns {Promise} The promise resolves into the response from the provider modules method.
*/
export default async function provider(req, res) {
  if (!Object.hasOwn(providerModules, req.params.provider)) {
    return res.status(404).send('Failed to validate provider param.');
  }

  if (providerModules[req.params.provider] === null) {
    return res.status(405).send('Provider is not configured.');
  }

  const response = await providerModules[req.params.provider](req, res);

  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (response instanceof Error) {
    return res.status(500).send('Provider request failed.');
  }

  if (typeof response === 'object') {
    return res.json(response);
  }

  let contentType = 'text/plain';

  // Executable MIME types must be derived from the requested resource rather than user input.
  if (req.params.url?.match(/\.m?js(?:[?#].*)?$/i)) {
    contentType = 'text/javascript';
  } else if (allowedContentTypes.has(req.params.content_type)) {
    contentType = req.params.content_type;
  }

  res.setHeader('content-type', contentType);

  // Provider endpoints intentionally return static resource bytes with a fixed MIME type and nosniff.
  res.send(response); // NOSONAR
}
