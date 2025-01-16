/**
## /sign/cloudfront

The cloudfront sign module exports a method to sign requests to an AWS cloudfront service.

@requires fs
@requires path
@requires aws-sdk/cloudfront-signer
@requires module:/utils/processEnv
@module /sign/cloudfront
*/

const env = require('../utils/processEnv.js')


let getSignedUrl, privateKey;

//Export nothing if the cloudfront key is not provided
if(!env.KEY_CLOUDFRONT){

    module.exports = null

} else {

  //Third party sources are optional
  try {

    const { readFileSync } = require('fs')
    const { join } = require('path')
    privateKey = String(readFileSync(join(__dirname, `../../${env.KEY_CLOUDFRONT}.pem`)))

    getSignedUrl = require('@aws-sdk/cloudfront-signer').getSignedUrl;
    module.exports = cloudfront_signer

  } catch (err) {

    console.error(err)

    module.exports = null
  }
}

/**
@function cloudfront_signer
@async

@description
The method creates a signed URL for a cloudfront resource.

@param {String} req_url Cloudfront resource URL.

@returns {Promise<String>} The method resolves to a string which contains the signed url.
*/
async function cloudfront_signer(req_url) {

  try {

    // Substitutes {*} with env.SRC_* key values.
    const url = (req_url).replace(/{(?!{)(.*?)}/g,
      matched => env[`SRC_${matched.replace(/(^{)|(}$)/g, '')}`])

    const date = new Date(Date.now())

    date.setDate(date.getDate() + 1);

    const signedURL = getSignedUrl({
      url: `https://${url}`,
      keyPairId: env.KEY_CLOUDFRONT,
      dateLessThan: date.toDateString(),
      privateKey
    });

    // Return signedURL only from request.
    return signedURL

  } catch(err){
    console.error(err)
    return err
  }
}
