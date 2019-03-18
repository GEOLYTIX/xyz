module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/layer/table',
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

      const table = layer.tableview.tables[req.query.table];

      // Return 406 if table is not defined as request parameter.
      if (!table) return res.code(406).send('Missing table.');

      let
        viewport = req.query.viewport,
        filter = req.query.filter && JSON.parse(req.query.filter),
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);


      if (viewport && layer.geom) {

        viewport = `
        WHERE
          ST_DWithin(
            ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
            ${layer.geom},
            0.00001)`;

      }

      if (viewport && layer.geom_3857) {

        viewport = `
        WHERE
          ST_DWithin(
            ST_Transform(
              ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
              3857),
            ${layer.geom_3857},
            0.00001)`;

      }
             

      const access_filter = layer.access_filter
        && token.email
        && layer.access_filter[token.email.toLowerCase()] ?
        layer.access_filter[token.email] :
        null;

      Object.assign(filter, access_filter);

      // SQL filter
      const filter_sql = filter && await require(global.appRoot + '/mod/pg/sql_filter')(filter) || '';


      let fields = await require(global.appRoot + '/mod/pg/sql_fields')([], table.columns);
      
      let q = `
        SELECT ${layer.qID} AS qID, ${fields}
        FROM ${table.from}
        ${viewport || ''}
        ${filter_sql}
        FETCH FIRST 99 ROW ONLY;`;

      //   ORDER BY ${layer.qID || 'id'}
      //   OFFSET ${99*offset} ROWS
      //   FETCH FIRST 99 ROW ONLY;

      //console.log(q);

      var rows = await global.pg.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);
    }
  });
};