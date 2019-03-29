module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/location/edit/field/setnull',
    preValidation: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, {
        public: global.public
      })
    ]),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          locale: { type: 'string' },
          layer: { type: 'string' },
          table: { type: 'string' },
          id: { type: 'string' },
          field: { type: 'string' },
        },
        required: ['locale', 'layer', 'table', 'id', 'field']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
    ],
    handler: async (req, res) => {
              
  
      let
        layer = req.params.layer,
        table = req.query.table,
        qID = layer.qID,
        id = req.query.id,
        field = req.query.field;
  
      // Check whether string params are found in the settings to prevent SQL injections.
      // if ([table]
      //   .some(val => (typeof val === 'string'
      //     && global.workspace.lookupValues.indexOf(val) < 0))) {
      //   return res.code(406).send(new Error('Invalid parameter.'));
      // }
  
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