/**
@module /provider/getFrom
*/

import logger from '../utils/logger.js';

import cloudfront from '../provider/cloudfront.js';

import file from '../provider/file.js';

export default {
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
      return;
    }
  },
  file: (ref) => file(ref.split(':')[1]),
  cloudfront: (ref) => cloudfront(ref.split(':')[1]),
};
