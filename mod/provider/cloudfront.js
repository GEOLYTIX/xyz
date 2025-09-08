/**
## /provider/cloudfront

The cloudfront provider module exports a method to fetch resources from an AWS cloudfront service.

@requires /utils/logger
@requires /sign/cloudfront

@module /provider/cloudfront
*/
import cloudfront_signer from '../sign/cloudfront.js';
import logger from '../utils/logger.js';

/**
@function cloudfront
@async

@description
The method creates a signed URL for a cloudfront resource, fetches the resource and returns the fetched resource.

A buffer is returned with the ref.params.buffer flag.

JSON is returned if the URL path matches the .json file ending to fetch a JSON resource from the cloudfront service.

The fetch response will be parsed as text by default.

@param {Object|string} ref Reference object or URL string.
@property {Object} [ref.params] Optional parameters for the request.
@property {string} [params.url] Cloudfront resource URL.
@property {boolean} [params.signedURL] Return a signedURL only.
@property {boolean} [params.buffer] Return a buffer from the fetch.

@returns {Promise<String|JSON|Buffer|Error>} The method resolves to either JSON, Text, or Buffer dependent ref.params.
*/
export default cloudfront_signer ? cloudfront : null;

const cacheMap = new Map();

async function cloudfront(ref, cache) {

  const url = ref.params?.url || ref;

  // Return signedURL only from request.
  if (ref.params?.signedURL) {
    return await cloudfront_signer(url);
  }

  let response;

  if (cache) {
    let cachedURL = cacheMap.get(url);

    if (!cachedURL) {
      cachedURL = Fetch(url, ref.params);
      cacheMap.set(url, cachedURL);
    }

    response = await cachedURL;
  } else {
    response = await Fetch(url);
  }

  return response;
}

async function Fetch(url, params) {
  const signedURL = await cloudfront_signer(url);

  if (signedURL instanceof Error) {
    return signedURL;
  }

  const response = await fetch(signedURL);

  logger(`${response.status} - ${url}`, 'cloudfront');

  if (response.status >= 300) return new Error(`${response.status} ${url}`);

  if (url.match(/\.json$/i)) return await response.json();

  if (params?.buffer) {
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  return await response.text();
}
