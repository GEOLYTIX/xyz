module.exports = fastify => {

  global.dir = process.env.DIR || '';

  global.failed_attempts = parseInt(process.env.FAILED_ATTEMPTS) || 3;

  global.access = process.env.PRIVATE ? 'private' : 'public';

  global.alias = process.env.ALIAS ? process.env.ALIAS : null;

  global.KEYS = {};
  Object.keys(process.env).forEach(key => {
    if (key.split('_')[0] === 'KEY') {
      global.KEYS[key.split('_')[1]] = process.env[key];
    }
  });

  global.DBS = {};
  Object.keys(process.env).forEach(key => {
    if (key.split('_')[0] === 'DBS') {
      fastify.register(require('fastify-postgres'), {
        connectionString: process.env[key],
        name: key.split('_')[1]
      });
    }
  });
};