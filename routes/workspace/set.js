const env = require(global.__approot + '/mod/env');

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

      // // Save workspace to PostgreSQL.
      // env.pg.ws_save = async workspace => {
 
      //   await ws_query(`
      // INSERT INTO ${workspace_table} (settings)
      // SELECT $1 AS settings;`,
      //   [JSON.stringify(workspace)]);
 
      // };
      
      // // Save checked workspace to PostgreSQL table.
      // if (env.pg.ws_save) await env.pg.ws_save(workspace);
         
      // Return checked workspace to sender.
      res.code(200).send(workspace);
        
    }
  });
};