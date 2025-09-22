/**
### /sign/cloudinary

Exports the cloudinary signer method.

@requires crypto
@requires /utils/processEnv

@module /sign/cloudinary
*/

import { createHash } from 'crypto';

/**
@function cloudinary
@async

@description
The cloudinary signer method signs requests for the cloudinary service.

The default request for uploading resources to cloudinary.

A request to destroy a resource stored in the cloudinary service can be signed with the destroy request parameter being truthy.

A folder and public_id parameter for resources to be uploaded or destroyed are required.

@param {req} req HTTP request.
@param {req} res HTTP response.
@property {Object} req.params Request parameter.
@property {string} params.folder
@property {string} params.public_id
@property {string} params.destroy

@returns {Promise} The promise resolves into the response from the signerModules method.
*/
export default async function cloudinary(req, res) {
  if (!xyzEnv.CLOUDINARY_URL)
    return new Error('CLOUDINARY_URL not provided in xyzEnv');

  if (!req.params.folder)
    return new Error(
      'A folder request param is required for the cloudinary signer.',
    );

  if (!req.params.public_id)
    return new Error(
      'A public_id request param is required for the cloudinary signer.',
    );

  // Split CLOUDINARY_URL string into array of ['cloudinary', api_key, api_secret, cloud_name]
  const cloudinary = xyzEnv.CLOUDINARY_URL.replaceAll('://', '|')
    .replaceAll(':', '|')
    .replaceAll('@', '|')
    .split('|');

  const folder = (req.params.folder += '/');

  // The timestamp is required for the signature which is valid for 1hr.
  const timestamp = Date.now();

  const params = [`timestamp=${timestamp}${cloudinary[2]}`];

  if (req.params.destroy) {
    params.unshift(`public_id=${folder}${req.params.public_id}`);
  } else {
    // Request is to upload a resource.
    params.unshift(`public_id=${req.params.public_id}`);
    params.unshift(`folder=${req.params.folder}`);
  }

  const toSign = params.join('&');

  const signature = createHash('sha256').update(toSign).digest('hex');

  params.push(`signature=${signature}`);

  params.push(`timestamp=${timestamp}`);

  params.push(`api_key=${cloudinary[1]}`);

  const method = req.params.destroy ? 'image/destroy' : 'upload';

  const signedUrl = `https://api.cloudinary.com/v1_1/${cloudinary[3]}/${method}?${params.join('&')}`;

  return signedUrl;
}
