module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/layer/table',
    beforeHandler: fastify.auth([fastify.authAPI]),
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
        viewport,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);


      if (layer.geom) {

        viewport = `
        WHERE
          ST_DWithin(
            ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
            ${layer.geom},
            0.00001)`;

      }

      if (layer.geom_3857) {

        viewport = `
        WHERE
          ST_DWithin(
            ST_Transform(
              ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
              3857),
            ${layer.geom_3857},
            0.00001)`;

      }

      // let offset = parseInt(req.body.offset);
              
      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string' && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }

      // SQL filter
      // const filter_sql = layer.filter && await require(global.appRoot + '/mod/pg/sql_filter')(layer.filter) || '';

      let fields = await require(global.appRoot + '/mod/pg/sql_fields')([], layer.infoj, layer.qID);
      
      let q = `
        SELECT ${layer.qID} AS qID, ${fields}
        FROM ${table}
        ${viewport}
        FETCH FIRST 99 ROW ONLY;`;
      //   ${filter_sql ? (viewport ? ` AND ${filter_sql}` : ` WHERE ${filter_sql}`) : ''} 
      //   ORDER BY ${layer.qID || 'id'}
      //   OFFSET ${99*offset} ROWS
      //   FETCH FIRST 99 ROW ONLY;
      // `;

      //console.log(q);

      var rows = await global.pg.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);
    }
  });
};