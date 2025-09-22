/**
## /provider/cloudfront

The cloudfront provider module exports a method to fetch resources from an AWS cloudfront service.

The fetch requests and their status can be logged with the 'cloudfront' log.

The provider module requires the cloudfront signer which requires a cloudfront key. If not provided the module will export null.

@requires /utils/logger
@requires /sign/cloudfront

@module /provider/cloudfront
*/
import cloudfront_signer from '../sign/cloudfront.js';
import logger from '../utils/logger.js';

/**
@function cloudfront

@description
The cloudfront method returns an async Fetch method which must be awaited to resolve into a cloudfront resource.

A req param will be provided by requests through the provider endpoint module.

The req param is string if the request for a resource is passed from the getFrom module.

@param {req|string} req Request object or URL string.
@property {object} [req.params] Request params.
@property {string} params.url URL in request param.

@returns {function} The async fetch function is returned.
*/
export default cloudfront_signer ? cloudfront : null;

function cloudfront(req) {
  const url = req.params?.url || req;

  return Fetch(url);
}

/**
@function fetch
@async

@description
The url string is passed to the cloudfront signer to request a signed URL.

The resource is fetched from the signed cloudfront URL.

The response is parsed as JSON if the URL ending matches `.json`

@param {string} url Cloudfront resource URL.

@returns {Promise<String|JSON|Error>} The fetch is resolved into either a string or JSON depending on the url ending.
*/
async function Fetch(url) {
  const signedURL = await cloudfront_signer(url);

  if (signedURL instanceof Error) {
    return signedURL;
  }

  const response = await fetch(signedURL);

  logger(`${response.status} - ${url}`, 'cloudfront');

  if (response.status >= 300) return new Error(`${response.status} ${url}`);

  if (url.match(/\.json$/i)) return await response.json();

  return await response.text();
}
