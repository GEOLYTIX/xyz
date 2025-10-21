/**
## /sign/file

The file sign module exports a method to sign requests to a file resource local to the instance.

@requires fs
@requires path
@requires url 
@module /sign/file
*/

import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let privateKey;

//Export nothing if the file key is not provided
export default xyzEnv.KEY_FILE
  ? (() => {
      try {
        privateKey = String(
          readFileSync(join(__dirname, `../../${xyzEnv.KEY_FILE}.pem`)),
        );

        return file_signer;
      } catch (error) {
        console.error(`File Signer: ${error.toString()}`);
        return null;
      }
    })()
  : null;

/**
@function file_signer
@async

@description
The method creates a signed URL for a file resource.

@param {req|string} req Request object or URL string.
@param {res} res Resposnse object.

@returns {String|ServerResponse} The function returns the signed url or the ServerResponse from the redirect.
*/
function file_signer(req, res) {
  try {
    const key = req.params?.key;

    req.params.host ??= `${req.host}${xyzEnv.DIR}`;

    if (!key) throw new Error('File Sign: key parameter was not provided');

    //Only check the env value if the request is for the same host.
    if (
      !key.startsWith(`./${xyzEnv.FILE_RESOURCES}/`) &&
      req.params.host === `${req.host}${xyzEnv.DIR}`
    )
      throw new Error('Unauthorized');

    const date = new Date(Date.now());

    date.setDate(date.getDate() + 1);

    //Signature only allows access to the requested file.
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(key)
      .digest('hex');

    const params = {
      expires: Date.parse(date),
      key_id: xyzEnv.KEY_FILE,
      signature: signature,
      url: key,
    };

    //Build up URL
    let paramString = '';
    for (const key of Object.keys(params)) {
      let urlParam = `${key}=${encodeURIComponent(params[key])}`;
      if (key !== Object.keys(params).at(-1)) urlParam = `${urlParam}&`;

      paramString += urlParam;
    }

    const signedURL = `https://${req.params.host}/api/provider/file?${paramString}`;

    //Redirect to the file
    if (req.params.redirect) {
      res.setHeader('location', signedURL);
      return res.status(302).send();
    }
    // Return signedURL only from request.
    return signedURL;
  } catch (err) {
    console.error(err);
    return err;
  }
}
