/**
## /provider/getFrom

The getFrom provider module allows XYZ modules to get resources either from configured sources.

@module /provider/getFrom
*/

import logger from '../utils/logger.js';
import cloudfront from './cloudfront.js';
import file from './file.js';

const getFromModules = {
  cloudfront: Cloudfront,
  file: File,
  https: Https,
};

/**
 Create file custom getFrom functions
  Custom file getFrom functions can be built from env keys with the following pattern:
  `SIGN_FUNCTION_NAME: url`

  This should be accompanied by a matching key:
  `SIGN_FUNCTION_NAME: key_file_name`

  These two options will be added to an object along with the file ref 
 */
for (const key in xyzEnv) {
  //Custom file get functions have a SIGN_XXX patern.
  //The match is what is used to name the function.
  const match = key.match(/^SIGN_(.*)/)?.[1];
  if (match === undefined) continue;

  //The associated key should be in the form KEY_XXX
  const signingKey = xyzEnv[`KEY_${match}`];
  if (!signingKey) continue;

  //Set up a function that passes the key name and the host url name
  //And the file name as `src`
  getFromModules[match.toLocaleLowerCase()] = (ref) => {
    const src = ref.split(':')[1];
    const params = {
      params: {
        url: src,
        signing_key: `KEY_${match}`,
        host_key: key,
      },
    };
    return file(params);
  };
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
