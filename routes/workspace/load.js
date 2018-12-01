// Save workspace provided in post body to the Postgres table.
module.exports = fastify => {
  fastify.route({
    method: 'POST',
    url: '/workspace/load',
    beforeHandler: fastify.auth([fastify.authAdminAPI]),
    handler: async (req, res) => {
      
      // Check workspace.
      const workspace = await require(global.appRoot + '/mod/workspace/check')(req.body.settings);
      
      // Save checked workspace to PostgreSQL table.
      if (global.pg.ws_save) await global.pg.ws_save(workspace);

      // Load checked workspace into memory.
      await require(global.appRoot + '/mod/workspace/load')(workspace);
          
      // Return checked workspace to sender.
      res.code(200).send(workspace);
        
    }
  });
};