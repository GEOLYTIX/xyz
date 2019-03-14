// Get the stored workspace config for the token access level.
module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/workspace/get',
    schema: {
      querystring: {
        token: { type: 'string' }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            documentation: { type: 'string' },
            locales: {},
          }
        }
      }
    },
    preHandler: fastify.auth([fastify.authAPI]),
    handler: (req, res) => {

      // Decode token from query or use a public access if no token has been provided.
      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      // Send workspace
      res.send(global.workspace['admin'].config);
      
    }
  });
};