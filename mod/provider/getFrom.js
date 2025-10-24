/**
## /provider/getFrom

The getFrom provider module allows XYZ modules to get resources either from configured sources.

@requires ../sign/file
@requires ../utils/logger
@requires ./cloudfront
@requires ./file

@module /provider/getFrom
*/

import file_signer from '../sign/file.js';
import logger from '../utils/logger.js';
import cloudfront from './cloudfront.js';
import file from './file.js';

const getFromModules = {
  cloudfront: Cloudfront,
  file: File,
  https: Https,
};

// Assign XYZ method for each SIGN_* key in xyzEnv
for (const key in xyzEnv) {
  //Custom file get functions have a SIGN_XXX patern.
  const PROVIDER = new RegExp(/^SIGN_(.*)/).exec(key)?.[1];
  if (PROVIDER === undefined) continue;
  getFromModules[PROVIDER] = XYZ;
}

export default getFromModules;

const cacheMap = new Map();

/**
@function Cloudfront
@async

@description
The method will extract a cloudfront URL from the ref param string.

The fetch request will be created from the cloudfront provider module with the cloudfront url.

The fetch request will be stored in a cache Map object for requests from the [cacheTemplates workspace module]{@link module:/workspace~cacheTemplates}. 

@param {string} ref Cloudfront resource reference.
@param {boolean} cache The resource fetch request should be cached.

@returns {Promise<String|JSON|Error>} The fetch is resolved into either a string or JSON depending on the url ending.
*/
async function Cloudfront(ref, cache) {
  if (!xyzEnv.KEY_CLOUDFRONT) {
    return console.error('Cloudfront key is missing');
  }

  const url = ref.split(':')[1];

  let response;

  if (cache) {
    let cachedURL = cacheMap.get(url);

    if (!cachedURL) {
      cachedURL = cloudfront(url);
      cacheMap.set(url, cachedURL);
    }
    response = await cachedURL;
  } else {
    // The cacheMap must be cleared to prevent cached resource never being updated between role requests or tests.
    cacheMap.clear();
    response = await cloudfront(url);
  }

  return response;
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

/**
@function XYZ
@async

@description
The method splits the reference string into a params object for the XYZ file signer.

@param {string} ref Reference for the XYZ signer.

@returns {Promise<String|JSON|Error>} The fetch is resolved into either a string or JSON depending on the url ending.
*/
async function XYZ(ref) {
  const params = {
    signing_key: ref.split(':')[0],
    url: ref.split(':')[1],
  };

  const signedUrl = file_signer({ params });

  //Different content types require Different request headers
  //These will get assigned based on the file ending
  const fileType = signedUrl.split('.').at(-1);
  const contentTypes = {
    json: 'application/json',
    html: 'text/html',
    js: 'text/javascript',
  };
  const contentType = contentTypes[fileType] || 'text/plain';

  const response = await fetch(signedUrl, {
    headers: {
      'Content-Type': contentType,
    },
  });

  if (!response.ok) {
    return new Error(`Failed to fetch`);
  }

  const content =
    fileType === 'json' ? await response.json() : await response.text();

  return content;
}
