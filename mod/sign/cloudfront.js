/**
## /sign/cloudfront

The cloudfront sign module exports a method to sign requests to an AWS cloudfront service.

@requires fs
@requires path
@requires aws-sdk/cloudfront-signer

@module /sign/cloudfront
*/


let getSignedUrl;

//Export nothing if the cloudfront key is not provided
if(!process.env.KEY_CLOUDFRONT){

    console.log('Cloudfront Sign: Missing credentials from env: KEY_CLOUDFRONT')
    module.exports = null

}
else{

    //Third party sources are optional
    try{

        getSignedUrl = require('@aws-sdk/cloudfront-signer').getSignedUrl;
        module.exports = cloudfront_signer
    
    }catch(err){
    
        if(err.code === 'MODULE_NOT_FOUND'){
    
            console.log('AWS_SDK/Cloudfront-Signer is not available')
            module.exports = null
        }
    
        else throw err
    }
}

const { readFileSync } = require('fs')
const { join } = require('path')

/**
@function cloudfront_signer
@async

@description
The method creates a signed URL for a cloudfront resource.

@param {Object|String} req Reference object or URL string.
@property {Object} [req.params] Optional parameters for the request.
@property {string} [params.url] Cloudfront resource URL.

@returns {Promise<String>} The method resolves to a string which contains the signed url.
*/
async function cloudfront_signer(req) {

  try {

    // Substitutes {*} with process.env.SRC_* key values.
    const url = (req.params?.url || req).replace(/{(?!{)(.*?)}/g,
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
    return JSON.stringify(signedURL)
  }
  catch(err){
    console.error(err)
  }
}