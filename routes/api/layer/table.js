module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/layer/table',
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
          filter: { type: 'string' },
        },
        required: ['locale', 'layer', 'table']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      fastify.evalParam.layerTable,
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        table = req.params.table,
        viewport = req.query.viewport,
        filter = req.params.filter,
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

      var rows = await global.pg.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);
    }

  });
};