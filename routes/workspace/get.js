// Get the stored workspace config for the token access level.
module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/workspace/get',
    preValidation: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, {
        public: global.public
      })
    ]),
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
    handler: (req, res) => {

      // Decode token from query or use a public access if no token has been provided.
      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public', roles: [] };

      const locales = JSON.parse(JSON.stringify(global.workspace.current.locales));

      (function objectEval(o, parent, key) {
 
        // check whether the object has an access key matching the current level.
        if (Object.entries(o).some(
          e => e[0] === 'roles' && !Object.keys(e[1]).some(
            role=> token.roles.includes(role)
          )
        )) {
      
          // if the parent is an array splice the key index.
          if (parent.length > 0) return parent.splice(parseInt(key), 1);
      
          // if the parent is an object delete the key from the parent.
          return delete parent[key];
        }
      
        // iterate through the object tree.
        Object.keys(o).forEach((key) => {
          if (o[key] && typeof o[key] === 'object') objectEval(o[key], o, key);
        });
      
      })(locales);

      // Send workspace
      res.send({locales: locales});
      
    }
  });
  
};