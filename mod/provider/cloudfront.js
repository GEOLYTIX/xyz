/**
 * @module /provider/cloudfront
 */

const { readFileSync } = require('fs')
const { join } = require('path')
const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');
const logger = require('../utils/logger')

/**
 * Fetches and processes content from CloudFront with signed URLs
 * @async
 * @param {Object|string} ref - Reference object or URL string
 * @param {Object} [ref.params] - Optional parameters for the request
 * @param {string} [ref.params.url] - URL to fetch from CloudFront
 * @param {boolean} [ref.params.signedURL] - If true, returns only the signed URL
 * @param {boolean} [ref.params.buffer] - If true, returns response as buffer
 * @returns {Promise<string|Object|Buffer|Error>} 
 *          - String for text responses
 *          - Object for JSON responses
 *          - Buffer if buffer parameter is true
 *          - Error if response status >= 300
 * @throws {Error} Logs error to console if request fails
 * 
 * @example
 * // Fetch JSON with signed URL
 * const data = await cloudfront({ 
 *   params: { 
 *     url: 'example.com/data.json'
 *   }
 * });
 * 
 * @example
 * // Get only signed URL
 * const signedUrl = await cloudfront({
 *   params: {
 *     url: 'example.com/file.txt',
 *     signedURL: true
 *   }
 * });
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