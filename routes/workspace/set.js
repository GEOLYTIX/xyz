const env = require(global.__approot + '/mod/env');

const checkWorkspace = require(global.__approot + '/mod/checkWorkspace');

module.exports = fastify => {
  fastify.route({
    method: 'POST',
    url: '/workspace/set',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        admin_workspace: true
      })
    ]),
    handler: async (req, res) => {
      
      // Check workspace.
      const workspace = await checkWorkspace(JSON.parse(req.body.settings));
      
      // Save checked workspace to PostgreSQL table.
      if (env.pg.ws_save) await env.pg.ws_save(workspace);
         
      // Return checked workspace to sender.
      res.code(200).send(workspace);
        
    }
  });
};