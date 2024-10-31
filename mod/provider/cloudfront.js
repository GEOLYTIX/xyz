/**
## /provider/cloudfront

The cloudfront provider module exports a method to fetch resources from an AWS cloudfront service.

@requires fs
@requires path
@requires module:/utils/logger
@requires @aws-sdk/cloudfront-signer

@module /provider/cloudfront
*/

const { readFileSync } = require('fs')
const { join } = require('path')
const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');
const logger = require('../utils/logger')

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
module.exports = async function cloudfront(ref) {

  try {

    // Substitutes {*} with process.env.SRC_* key values.
    const url = (ref.params?.url || ref).replace(/{(?!{)(.*?)}/g,
      matched => process.env[`SRC_${matched.replace(/(^{)|(}$)/g, '')}`])

    const date = new Date(Date.now())

    date.setDate(date.getDate() + 1);

    const signedURL = getSignedUrl({
      url: `https://${url}`,
      keyPairId: process.env.KEY_CLOUDFRONT,
      dateLessThan: date.toDateString(),
      privateKey: String(readFileSync(join(__dirname, `../../${process.env.KEY_CLOUDFRONT}.pem`)))
    });

    // Return signedURL only from request.
    if (ref.params?.signedURL) {
      return signedURL;
    }

    const response = await fetch(signedURL)
    
    logger(`${response.status} - ${url}`, 'cloudfront')

    if (response.status >= 300) return new Error(`${response.status} ${ref}`)

    if (url.match(/\.json$/i)) return await response.json()

    if (ref.params?.buffer) return await response.buffer()

    return await response.text()

  } catch (err) {

    console.error(err)
  }
}
