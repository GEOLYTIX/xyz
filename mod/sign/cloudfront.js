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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let privateKey, getSignedUrl;

try {
  ({ getSignedUrl } = await import('@aws-sdk/cloudfront-signer'));
} catch {
  //Dependencies not installed
}

//Export nothing if the cloudfront key is not provided
export default xyzEnv.KEY_CLOUDFRONT
  ? (() => {
      try {
        privateKey = String(
          readFileSync(join(__dirname, `../../${xyzEnv.KEY_CLOUDFRONT}.pem`)),
        );

        if (getSignedUrl) {
          return cloudfront_signer;
        } else {
          throw new Error('Missing Cloudfront signer dependency');
        }
      } catch (error) {
        console.error(error);
        return null;
      }
    })()
  : null; /**
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
      dateLessThan: date.toDateString(),
      keyPairId: xyzEnv.KEY_CLOUDFRONT,
      privateKey,
      url: `https://${url}`,
    });

    // Return signedURL only from request.
    return signedURL;
  } catch (err) {
    console.error(err);
    return err;
  }
}
