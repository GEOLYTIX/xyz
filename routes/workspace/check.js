const assignDefaults = require('../../mod/workspace/assignDefaults');

const checkLayer = require('../../mod/workspace/checkLayer');

module.exports = fastify => {
  fastify.route({
    method: 'POST',
    url: '/workspace/check',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        admin_workspace: true
      })
    ]),
    handler: async (req, res) => {
      
      // Check workspace.
      const workspace = await assignDefaults(JSON.parse(req.body.settings));

      const logArray = await checkLayer(workspace);
        
      // Return checked workspace to sender.
      res.code(200).send(logArray);
        
    }
  });
};