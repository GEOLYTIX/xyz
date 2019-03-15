module.exports = (fastify, authToken) => {
  fastify.route({
    method: 'POST',
    url: '/api/location/update',
    preHandler: fastify.auth([
      (req, res, done)=>authToken(req, res, done, { lv: global.access, API: true })
    ]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace['admin'].config.locales[req.body.locale];

      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.body.layer];

      if (!layer) return res.code(500).send('Layer not found.');

      let
        table = req.body.table,
        qID = layer.qID,
        id = req.body.id,
        infoj = req.body.infoj,
        geom = layer.geom;

      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table, geom, qID]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace['admin'].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
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

      var q =
      `SELECT ${fields.join()}`
      + `\n FROM ${table}`
      + `\n WHERE ${qID} = $1;`;

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