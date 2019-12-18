const env = require('../mod/env');

const fetch = require('node-fetch');

module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/proxy/cdn',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    handler: async (req, res) => {

      if (req.query.uri.toLowerCase().includes('api.github')) {

        const response = await fetch(
          req.query.uri,
          { headers: new fetch.Headers({ Authorization: `Basic ${Buffer.from(env.keys.GITHUB).toString('base64')}` }) });

        const b64 = await response.json();
        const buff = await Buffer.from(b64.content, 'base64');
        const file = await buff.toString('utf8');
        return res.type(req.query.type).send(file);

      }

      if (!req.query.source) {

        const response = await fetch(req.query.uri);
        const file = await response.text();
        return res.type(req.query.type).send(file);

      }

    }
  });
};