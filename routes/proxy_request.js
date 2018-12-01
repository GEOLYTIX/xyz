module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/proxy/request',
    beforeHandler: fastify.auth([fastify.authAPI]),
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