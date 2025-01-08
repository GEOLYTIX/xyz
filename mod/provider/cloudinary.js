/**
@module /cloudinary
*/

const { createHash } = require('crypto');

const env = require('../../mapp_env.js')

// 1: api_key
// 2: api_secret
// 3: cloud_name
const cloudinary = env.CLOUDINARY_URL?.replaceAll('://', ' ').replaceAll(':', ' ').replaceAll('@', ' ').split(' ');

module.exports = async req => {

  if (!cloudinary) {
    console.warn(`env.CLOUDINARY_URL not set`);
    return;
  }

  // Destroy cloudinary resource.
  if (req.params.destroy) return await destroy(req);

  const data = generateData(req, 'upload');

  req.body = req.body && await bodyData(req) || null;

  // Convert body to appropriate format
  const file = req.params.resource_type === 'raw' ? req.body.toString() : `data:image/jpeg;base64,${req.body.toString('base64')}`;
  data.append('file', file);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary[3]}/upload`, {
    method: 'post',
    body: data,
  });

  return await response.json();
}

async function destroy(req) {
  const data = generateData(req, 'destroy');
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary[3]}/image/destroy`, {
    method: 'post',
    body: data,
  });

  return await response.json();
}

function generateData(req, action) {
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

function bodyData(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', error => reject(error));
  });
}