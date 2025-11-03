/**
## /sign/file

The file sign module exports a method to sign requests to a file resource local to the instance.

@module /sign/file
*/

import crypto from 'node:crypto';

/**
@function file_signer
@async

@description
The method creates a signed URL for a file resource.

@param {req|string} req Request object or URL string.
@param {res} res Resposnse object.

@returns {String|ServerResponse} The function returns the signed url or the ServerResponse from the redirect.
*/
export default function file_signer(req, res) {
  try {
    const privateKey = xyzEnv.WALLET[req.params.signing_key];

    if (privateKey === undefined) throw new Error('privateKey undefined');

    const date = new Date(Date.now());

    date.setDate(date.getDate() + 1);

    //Signature only allows access to the requested file.
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(req.params.url)
      .update(req.params.signing_key)
      .update(String(Date.parse(date)))
      .digest('hex');

    const params = {
      expires: Date.parse(date),
      key_id: req.params.signing_key,
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

    const host = xyzEnv[`SIGN_${req.params.signing_key}`];

    const signedURL = `https://${host}/api/provider/file?${paramString}`;

    return signedURL;
  } catch (err) {
    console.error(err);
    return err;
  }
}
