/**
@module /sign/cloudinary
*/

const { createHash } = require('crypto');

const env = require('../../mapp_env.js')

module.exports = async req => {
    // 1: api_key
    // 2: api_secret
    // 3: cloud_name
    const cloudinary = env.CLOUDINARY_URL?.replaceAll('://', ' ').replaceAll(':', ' ').replaceAll('@', ' ').split(' ');
    const baseUrl = `https://api.cloudinary.com/v1_1/${cloudinary[3]}/`

    const folder = (!req.params.folder) ? '' : `${req.params.folder}/`

    // The timestamp is required for the signature which is valid for 1hr.
    const timestamp = Date.now();
    let toSign = '';

    // Define signature string based on the action (upload/destroy)
    if (!req.params.destroy) {
        toSign = `folder=${req.params.folder}&public_id=${req.params.public_id}&timestamp=${timestamp}${cloudinary[2]}`;

    } else if (req.params.destroy) {
        toSign = `public_id=${folder}${req.params.public_id}&timestamp=${timestamp}${cloudinary[2]}`;
    }

    const signature = createHash('sha256').update(toSign).digest('hex');
    const params = `${toSign}&signature=${signature}&timestamp=${timestamp}&api_key=${cloudinary[1]}`;
    const signedUrl = `${baseUrl}${req.params.destroy ? 'image/destroy' : 'upload'}?${params}`
    
    return {signedUrl:signedUrl};
}