module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/proxy/request',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: global.public
      })
    ]),
    handler: (req, res) => {

      // Split token and provider param from originalUrl.
      const uri = req.req.originalUrl
        .split('/proxy/request?uri=').pop()
        .split('&token=').shift()
        .split('&provider=').shift();

      // Decorate the URI with a provider key and send response object to client.
      res.send(require('request')(`${uri}&${global.KEYS[req.query.provider]}`));

    }
  });
};