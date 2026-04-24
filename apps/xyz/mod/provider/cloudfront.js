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
The cloudfront provider method will parse an URL from the request parameter and sign this request through the cloudfront signer module.

The module will attempt to fetch a resource from the signed request URL.

An error will be returned if the signing or fetching fails.

The fetched will resource body will be parsed as JSON if the URL ends in `.json`. Otherwise the resource body will be parsed as text.

@param {req|string} req Request object or URL string.
@property {object} [req.params] Request params.
@property {string} params.url URL in request param.

@returns {Promise<Object|Error>}
*/
export default cloudfront_signer ? cloudfront : null;

async function cloudfront(req) {
  try {
    const url = req.params?.url || req;

    const signedURL = await cloudfront_signer(url);

    if (signedURL instanceof Error) {
      return signedURL;
    }

    const timestamp = Date.now();

    // Fetch will fail with an invalid domain.
    const response = await fetch(signedURL);

    logger(
      `${Date.now() - timestamp}: ${response.status} - ${url}`,
      'cloudfront',
    );

    if (response.status >= 300) return new Error(`${response.status} ${url}`);

    if (url.match(/\.json$/i)) return await response.json();

    return await response.text();
  } catch (err) {
    console.error(err);
    return err;
  }
}
