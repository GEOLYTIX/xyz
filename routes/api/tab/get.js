module.exports = fastify => {
  fastify.route({
    method: 'POST',
    url: '/api/tab/get',
    beforeHandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {

      //console.log(req.body);

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };
      const locale = global.workspace[token.access].config.locales[req.body.locale];
            
      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.body.layer];

      // Return 406 if layer is not found in locale.
      if (!layer) return res.code(406).send('Invalid layer.');

      const table = req.body.table;

      // Return 406 if table is not defined as request parameter.
      if (!table) return res.code(406).send('Missing table.');

      let 
        //filter = req.body.filter && JSON.parse(req.body.filter),
        west = parseFloat(req.body.west),
        south = parseFloat(req.body.south),
        east = parseFloat(req.body.east),
        north = parseFloat(req.body.north),
        count = parseInt(req.body.count);
              
      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string' && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }

      // SQL filter
      const filter_sql = layer.filter && await require(global.appRoot + '/mod/pg/sql_filter')(layer.filter) || '';

      let fields = await require(global.appRoot + '/mod/pg/sql_fields')([], layer.infoj, layer.qID);

      let q = `SELECT ${fields} FROM ${table} WHERE
        ST_DWithin(
            ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326), ${layer.geom}, 0.00001) 
            ${filter_sql ? `AND ${filter_sql}` : ''} 
            LIMIT ${count};`;

      console.log(q);

      var rows = await global.pg.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // return 202 if no locations found within the envelope.
      if (parseInt(rows[0].count) === 0) return res.code(200).send([]);

      res.code(200).send(rows);
    }
  });
};