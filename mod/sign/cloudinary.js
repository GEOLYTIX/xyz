const { createHash } = require('crypto');

// 1: api_key
// 2: api_secret
// 3: cloud_name
const cloudinary = process.env.CLOUDINARY_URL?.replaceAll('://', ' ').replaceAll(':', ' ').replaceAll('@', ' ').split(' ');

module.exports = async req => {
    const action = req.params.upload || req.params.destroy
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
    const data = new FormData();

    data.append('public_id', req.params.public_id);
    data.append('api_key', cloudinary[1]);
    data.append('timestamp', timestamp);
    data.append('signature', signature);

    // Append folder for upload action
    if (action === 'upload') {
        data.append('folder', req.params.folder);
    }

    return data;
}