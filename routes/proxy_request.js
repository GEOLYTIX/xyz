const env = require('../mod/env');

const request = require('request');

module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/proxy/request',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    handler: (req, res) => {

      // Split token and provider param from originalUrl.
      const uri = req.req.originalUrl
        .split('/proxy/request?uri=').pop()
        .split('&token=').shift()
        .split('&provider=').shift();

      // Decorate the URI with a provider key and send response object to client.
      res.send(request(`${uri}&${env.keys[req.query.provider]}`));

    }
  });
};