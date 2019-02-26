module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/location/edit/field/setnull',
    preHandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {
              
      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };
              
      const locale = global.workspace[token.access].config.locales[req.query.locale];
  
      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');
              
      const layer = locale.layers[req.query.layer];
              
      // Return 406 if layer is not found in locale.
      if (!layer) return res.code(406).send('Invalid layer.');
              
      const table = req.query.table;
              
      // Return 406 if table is not defined as request parameter.
      if (!table) return res.code(406).send('Missing table.');
  
      let
        qID = layer.qID,
        id = req.query.id,
        field = req.query.field;
  
        // Check whether string params are found in the settings to prevent SQL injections.
      if ([table, field]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }
  
      var q = `UPDATE ${table} SET ${field} = null WHERE ${qID} = $1;`;
  
      var rows = await global.pg.dbs[layer.dbs](q, [id]);
  
      if (rows.err) return res.code(500).send('PostgreSQL query error - please check backend logs.');
  
      // Query field for updated infoj
      const infoj = JSON.parse(JSON.stringify(layer.infoj));
  
      // The fields array stores all fields to be queried for the location info.
      fields = await require(global.appRoot + '/mod/pg/sql_fields')([], infoj, qID);
  
      var q = `SELECT ${fields.join()} FROM ${table} WHERE ${qID} = $1;`;
  
      var rows = await global.pg.dbs[layer.dbs](q, [id]);
  
      if (rows.err) return res.code(500).send('PostgreSQL query error - please check backend logs.');
  
      // Iterate through infoj entries and assign values returned from query.
      infoj.forEach(entry =>  {
        if (rows[0][entry.field]) entry.value = rows[0][entry.field];
      });
  
      // Send the infoj object with values back to the client.
      res.code(200).send(infoj);

    }
  });
};