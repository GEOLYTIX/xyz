/**
## /sign/cloudfront

The cloudfront sign module exports a method to sign requests to an AWS cloudfront service.

@requires fs
@requires path
@requires aws-sdk/cloudfront-signer
@requires module:/utils/processEnv
@module /sign/cloudfront
*/

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let privateKey, exportedModule;

//Export nothing if the cloudfront key is not provided
if (!xyzEnv.KEY_CLOUDFRONT) {
  exportedModule = null;
} else {
  //Third party sources are optional
  try {
    privateKey = String(
      readFileSync(join(__dirname, `../../${xyzEnv.KEY_CLOUDFRONT}.pem`)),
    );
    exportedModule = cloudfront_signer;
  } catch (err) {
    console.error(err);
    exportedModule = null;
  }
}

export default exportedModule;

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
    // Substitutes {*} with xyzEnv.SRC_* key values.
    const url = req_url.replace(
      /{(?!{)(.*?)}/g,
      (matched) => xyzEnv[`SRC_${matched.replace(/(^{)|(}$)/g, '')}`],
    );

    const date = new Date(Date.now());

    date.setDate(date.getDate() + 1);

    const signedURL = getSignedUrl({
      url: `https://${url}`,
      keyPairId: xyzEnv.KEY_CLOUDFRONT,
      dateLessThan: date.toDateString(),
      privateKey,
    });

    // Return signedURL only from request.
    return signedURL;
  } catch (err) {
    console.error(err);
    return err;
  }
}
