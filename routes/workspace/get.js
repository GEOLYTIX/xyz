const env = require('../../mod/env');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/workspace/get',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
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
    preHandler: [
      fastify.evalParam.token
    ],
    handler: (req, res) => {

      const locales = JSON.parse(JSON.stringify(env.workspace.locales));

      (function objectEval(o, parent, key) {
 
        // check whether the object has an access key matching the current level.
        if (Object.entries(o).some(
          e => e[0] === 'roles' && !Object.keys(e[1]).some(
            role=> req.params.token.roles && req.params.token.roles.includes(role)
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