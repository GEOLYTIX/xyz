/**
### /provider/s3

The S3 provider module requires the [S3 signer]{@link module:/sign/s3} and will return a signed request URL.

@requires /sign/s3

@module /provider/s3
*/

import s3_signer from '../sign/s3.js';

export default s3_signer ? s3_provider : null;

/**
@function s3_provider

@description
The s3_provider method returns the s3_signer method.

@param {Object} req HTTP request.
@param {Object} res HTTP response.

@returns {Function} The s3_signer module method.
**/
async function s3_provider(req, res) {
  return s3_signer(req, res);
}
