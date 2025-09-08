/**
@module /provider/getFrom
*/

import cloudfront from '../provider/cloudfront.js';
import file from '../provider/file.js';
import logger from '../utils/logger.js';

export default {
  cloudfront: Cloudfront,
  file: File,
  https: Https,
};

async function Cloudfront(ref, cache) {
  if (!xyzEnv.KEY_CLOUDFRONT) {
    return console.error('Cloudfront key is missing');
  }

  const src = ref.split(':')[1];

  return await cloudfront(src, cache);
}

function File(ref) {
  const src = ref.split(':')[1];

  return file(src);
}

async function Https(url) {
  try {
    const response = await fetch(url);

    logger(`${response.status} - ${url}`, 'fetch');

    if (url.match(/\.json$/i)) {
      return await response.json();
    }

    return await response.text();
  } catch (err) {
    console.error(err);
    return err;
  }
}
