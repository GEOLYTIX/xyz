const env = require('../../mod/env');

const assignDefaults = require('../../mod/workspace/assignDefaults');

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

      const workspace = JSON.parse(req.body.settings);
      
      // Check workspace.
      env.workspace = await assignDefaults(workspace);

      // Save workspace to PostgreSQL.
      if (env.pg.workspace) await env.pg.workspace(`
        INSERT INTO ${env.workspace_connection.split('|')[1]} (settings)
        SELECT $1 AS settings;`, [JSON.stringify(workspace)]);
         
      // Return checked workspace to sender.
      res.code(200).send();
        
    }
  });
};