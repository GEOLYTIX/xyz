/**
 * @module /provider/cloudfront
 * @description Provides functionality to interact with Amazon CloudFront, including generating signed URLs and fetching content.
 */

const { readFileSync } = require('fs')
const { join } = require('path')
const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');
const logger = require('../utils/logger')

/**
 * @function
 * @async
 * @param {Object} ref - Reference object containing URL and parameters
 * @returns {Promise<string|Object|Buffer>} - The fetched content
 * @throws {Error} If the fetch request fails
 */
module.exports = async ref => {
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

    if (ref.params?.buffer) return await response.arrayBuffer()

    return await response.text()
  } catch(err) {
    console.error(err)
  }
}
