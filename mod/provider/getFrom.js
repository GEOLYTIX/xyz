/**
@module /provider/getFrom
*/

import cloudfront from '../provider/cloudfront.js';
import file from '../provider/file.js';
import logger from '../utils/logger.js';

export default {
  cloudfront: (ref) =>
    xyzEnv.KEY_CLOUDFRONT
      ? cloudfront(ref.split(':')[1])
      : console.error('Cloudfront key is missing'),
  file: (ref) => file(ref.split(':')[1]),
  https: async (url) => {
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
  },
};
