module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/location/field/range',
    preValidation: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, {
        public: global.public
      })
    ]),
    handler: async (req, res) => {
        
      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };
  
      const locale = global.workspace['admin'].config.locales[req.query.locale];
  
      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');
  
      const layer = locale.layers[req.query.layer];
  
      // Return 406 if layer is not found in locale.
      if (!layer) return res.code(406).send('Invalid layer.');
  
      const table = req.query.table;
  
      // Return 406 if table is not defined as query parameter.
      if (!table) return res.code(406).send('Missing table.');
  
      const field = req.query.field;
  
      // Return 406 if ID is not defined as query parameter.
      if (!field) return res.code(406).send('Missing field.');
  
  
      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace['admin'].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }
           
      var q =
        `SELECT min(${field}), max(${field})`
        + `\n FROM ${table}`;;
  
      var rows = await global.pg.dbs[layer.dbs](q);
  
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  
      // return 204 if no record was returned from database.
      if (rows.length === 0) return res.code(202).send('No rows returned from table.');
       
      // Send the infoj object with values back to the client.
      res.code(200).send({
        min: rows[0].min,
        max: rows[0].max
      });
  
    }
  });
};