const { createHash } = require('crypto');

// 1: api_key
// 2: api_secret
// 3: cloud_name
const cloudinary = process.env.CLOUDINARY_URL?.replaceAll('://', ' ').replaceAll(':', ' ').replaceAll('@', ' ').split(' ');
const baseUrl = `https://api.cloudinary.com/v1_1/${cloudinary[3]}/upload`

module.exports = async req => {
    const action = req.params.destroy ? 'destroy' : 'upload'
    // The timestamp is required for the signature which is valid for 1hr.
    const timestamp = Date.now();
    let toSign = '';

    // Define signature string based on the action (upload/destroy)
    if (action === 'upload') {
        toSign = `folder=${req.params.folder}&public_id=${req.params.public_id}&timestamp=${timestamp}${cloudinary[2]}`;
    } else if (action === 'destroy') {
        toSign = `public_id=${req.params.public_id}&timestamp=${timestamp}${cloudinary[2]}`;
    }

    const signature = createHash('sha256').update(toSign).digest('hex');
    console.log(toSign)
    const params = `${toSign}&signature=${signature}&timestamp=${timestamp}&api_key=${cloudinary[1]}`;
    const signedUrl = `${baseUrl}?${params}`
    return {signedUrl:signedUrl};
}