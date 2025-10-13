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

@returns {String} The function returns the signed url.
*/
function file_signer(req) {
  try {
    // Substitutes {*} with xyzEnv.SRC_* key values.
    const url = req.params?.url;

    if (!url) throw new Error('File Sign: url parameter was not provided');

    if (!url.startsWith(`./${xyzEnv.FILE_RESOURCES}/`))
      throw new Error('Unauthorized');

    const date = new Date(Date.now());

    date.setDate(date.getDate() + 1);

    //Signature only allows access to the requested file.
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(url)
      .digest('hex');

    const params = {
      expires: Date.parse(date),
      key_id: xyzEnv.KEY_FILE,
      signature: signature,
      url: req.params.url,
    };

    //Build up URL
    let paramString = '';
    for (const key of Object.keys(params)) {
      let urlParam = `${key}=${encodeURIComponent(params[key])}`;
      if (key !== Object.keys(params).at(-1)) urlParam = `${urlParam}&`;

      paramString += urlParam;
    }

    const signedURL = `https://${req.host}${xyzEnv.DIR}/api/provider/file?${paramString}`;

    // Return signedURL only from request.
    return signedURL;
  } catch (err) {
    console.error(err);
    return err;
  }
}
