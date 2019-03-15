// Get the stored workspace config for the token access level.
module.exports = (fastify, authToken) => {

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
    preHandler: fastify.auth([
      (req, res, done)=>authToken(req, res, done, { lv: global.access, API: false })
    ]),
    handler: (req, res) => {

      // Decode token from query or use a public access if no token has been provided.
      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      // Send workspace
      res.send(global.workspace['admin'].config);
      
    }
  });
};