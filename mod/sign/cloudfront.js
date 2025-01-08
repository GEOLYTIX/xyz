/**
## /sign/cloudfront

The cloudfront sign module exports a method to sign requests to an AWS cloudfront service.

@requires fs
@requires path
@requires aws-sdk/cloudfront-signer

@module /sign/cloudfront
*/


let getSignedUrl, privateKey;

//Export nothing if the cloudfront key is not provided
if(!process.env.KEY_CLOUDFRONT){

    module.exports = null

} else {

  //Third party sources are optional
  try {

    const { readFileSync } = require('fs')
    const { join } = require('path')
    privateKey = String(readFileSync(join(__dirname, `../../${process.env.KEY_CLOUDFRONT}.pem`)))

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

    // Substitutes {*} with process.env.SRC_* key values.
    const url = (req_url).replace(/{(?!{)(.*?)}/g,
      matched => process.env[`SRC_${matched.replace(/(^{)|(}$)/g, '')}`])

    const date = new Date(Date.now())

    date.setDate(date.getDate() + 1);

    const signedURL = getSignedUrl({
      url: `https://${url}`,
      keyPairId: process.env.KEY_CLOUDFRONT,
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
