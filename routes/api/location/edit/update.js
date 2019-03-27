module.exports = fastify => {
  fastify.route({
    method: 'POST',
    url: '/api/location/update',
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
        },
        required: ['locale', 'layer', 'table', 'id']
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
        infoj = req.body.infoj,
        geom = layer.geom;

      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string'
          && global.workspace.lookupValues.indexOf(val) < 0))) {
        return res.code(406).send(new Error('Invalid parameter.'));
      }

      let fields = await require(global.appRoot + '/mod/pg/sql_infoj')(infoj);

      // const d = new Date();

      // const q_log = layer.log && layer.log.table ?
      //   `, ${layer.log.field || 'log'} = '{ "user": "${token.email}", "op": "update", "time": "${d.toUTCString()}"}'`
      //   : '';

      // Write into logtable if logging is enabled.
      // if (layer.log && layer.log.table) await writeLog(layer, id);

      var q = `UPDATE ${table} SET ${fields} WHERE ${qID} = $1;`;

      var rows = await global.pg.dbs[layer.dbs](q, [id]);

      if (rows.err) return res.code(500).send('PostgreSQL query error - please check backend logs.');

      
      if (layer.mvt_cache) await require(global.appRoot + '/mod/mvt_cache')(layer, table, id);


      // Query field for updated infoj
      infoj = JSON.parse(JSON.stringify(layer.infoj));

      geom = layer.geom ?
        `${table}.${layer.geom}`
        : `(ST_Transform(ST_SetSRID(${table}.${layer.geom_3857}, 3857), 4326))`;

      // The fields array stores all fields to be queried for the location info.
      fields = await require(global.appRoot + '/mod/pg/sql_fields')([], infoj, qID);

      // Push JSON geometry field into fields array.
      //fields.push(`\n   ST_asGeoJson(${geom}) AS geomj`);

      var q = `
        SELECT ${fields.join()}
        FROM ${table}
        WHERE ${qID} = $1;`;

      var rows = await global.pg.dbs[layer.dbs](q, [id]);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // Iterate through infoj entries and assign values returned from query.
      infoj.forEach(entry =>  {
        if (rows[0][entry.field]) entry.value = rows[0][entry.field];
      });
    
      // Send the infoj object with values back to the client.
      res.code(200).send(infoj);

    }
  });
};