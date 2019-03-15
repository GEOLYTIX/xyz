// Save workspace provided in post body to the Postgres table.
module.exports = (fastify, authToken) => {
  fastify.route({
    method: 'POST',
    url: '/workspace/load',
    preHandler: fastify.auth([
      (req, res, done)=>authToken(req, res, done, { lv: 'admin', API: true })
    ]),
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