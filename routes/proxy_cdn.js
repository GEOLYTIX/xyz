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

      if (req.query.source === 'GITHUB') {

        const response = await fetch(`${req.query.uri}?access_token=${env.keys.GITHUB}`);
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