/**
### /sign/cloudinary

Exports the cloudinary signer method.

@module /sign/cloudinary
*/

const { createHash } = require('crypto');

module.exports = async function cloudinary(req, res) {

  if (!process.env.CLOUDINARY_URL) return new Error('CLOUDINARY_URL not provided in process.env')

  // Split CLOUDINARY_URL string into array of ['cloudinary', api_key, api_secret, cloud_name]
  const cloudinary = process.env.CLOUDINARY_URL
    .replaceAll('://', '|')
    .replaceAll(':', '|')
    .replaceAll('@', '|')
    .split('|');

  const folder = req.params.folder += '/'

  // The timestamp is required for the signature which is valid for 1hr.
  const timestamp = Date.now();

  const params = [
    `timestamp=${timestamp}${cloudinary[2]}`
  ]

  if (req.params.destroy) {

    params.unshift(`public_id=${folder}${req.params.public_id}`)
  } else {

    params.unshift(`public_id=${req.params.public_id}`)
    params.unshift(`folder=${req.params.folder}`)
  }

  const toSign = params.join('&')

  const signature = createHash('sha256').update(toSign).digest('hex');

  params.push(`signature=${signature}`)

  params.push(`timestamp=${timestamp}`)

  params.push(`api_key=${cloudinary[1]}`)

  const method = req.params.destroy? 'image/destroy': 'upload';

  const signedUrl = `https://api.cloudinary.com/v1_1/${cloudinary[3]}/${method}?${params.join('&')}`

  return signedUrl;
}
