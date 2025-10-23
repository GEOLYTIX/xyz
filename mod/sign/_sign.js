/**
## /sign

The sign API provides access to different request signer modules. Signer modules which are unavailable will export as null and won't be available from the signerModules object methods.

@requires /sign/cloudinary
@requires /sign/s3

@module /sign
*/

import { ServerResponse } from 'node:http';
import cloudfront from './cloudfront.js';
import cloudinary from './cloudinary.js';
import file from './file.js';
import s3 from './s3.js';

const signerModules = {
  cloudfront,
  cloudinary,
  s3,
  file,
};

//Create file signer functions
for (const key in xyzEnv) {
  //File signers have a SIGN_XXX patern.
  const SIGNER = new RegExp(/^SIGN_(.*)/).exec(key)?.[1];
  if (SIGNER === undefined) continue;

  //Set up a function that passes the key name and the host url name
  signerModules[SIGNER] = (req, res) => {
    req.params.signing_key = SIGNER;
    return file(req, res);
  };
}

/**
@function signer
@async

@description
The signer method looks up a signerModules method matching the signer request parameter and passes the req/res objects as argument to the matched method.

The response from the method is returned with the HTTP response.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params Request parameter.
@param {string} params.signer Signer module to sign the request.

@returns {Promise} The promise resolves into the response from the signerModules method.
*/
export default async function signer(req, res) {
  if (!Object.hasOwn(signerModules, req.params.signer)) {
    return res
      .status(404)
      .setHeader('Content-Type', 'text/plain')
      .send(`Failed to validate 'signer=${req.params.signer}' param.`);
  }

  if (signerModules[req.params.signer] === null) {
    return res
      .status(405)
      .setHeader('Content-Type', 'text/plain')
      .send(`Signer: ${req.params.signer} is not configured.`);
  }

  const response = await signerModules[req.params.signer](req, res);

  if (response instanceof Error) {
    return res
      .status(500)
      .setHeader('Content-Type', 'text/plain')
      .send(response.message);
  }

  if (response instanceof ServerResponse) return response;

  res.send(response);
}
