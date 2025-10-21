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

const privateKeyIds = {};

/**
 Any SIGN_ keys with match KEY_ values are assigned to an object

 ```
  {
    "KEY_TEST_RESOURCE": key_name
  }

*/
for (const key in xyzEnv) {
  const match = key.match(/^SIGN_(.*)/)?.[1];

  if (match === undefined) continue;

  const keyValue = xyzEnv[`KEY_${match}`];

  if (!keyValue) continue;

  privateKeyIds[`KEY_${match}`] = keyValue;
}

//Export nothing if no file signing keys are provided
export default Object.keys(privateKeyIds).length
  ? (() => {
    try {
      //Read all supplied keys in.
      for (const key in privateKeyIds) {
        const privateKey = String(
          readFileSync(join(__dirname, `../../${privateKeyIds[key]}.pem`)),
        );

        privateKeyIds[key] = privateKey;
      }

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

    //assign the default key
    let privateKey = privateKeyIds.KEY_FILE;

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

    //The signing request may not be for the default key,
    //But for a different instances files.
    if (req.params.signing_key !== xyzEnv.FILE_KEY) {
      //Find the file to avoid passing user submitted params
      privateKey = privateKeyIds[req.params.signing_key];
    }

    //Signature only allows access to the requested file.
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(key)
      .digest('hex');

    const params = {
      expires: Date.parse(date),
      key_id: req.params.signing_key || xyzEnv.KEY_FILE,
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

    const signedURL = `http://${req.params.host}/api/provider/file?${paramString}`;

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
