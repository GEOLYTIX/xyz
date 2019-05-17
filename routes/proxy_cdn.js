const env = require('../mod/env');

const request = require('request');

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

      const response = await fetch(req.query.uri);
      const file = await response.text();

      // Decorate the URI with a provider key and send response object to client.
      res.type(req.query.type).send(file);

    }
  });
};