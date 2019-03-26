module.exports = fastify => {
  
  fastify.route({
    method: 'GET',
    url: '/api/layer/geojson',
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
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        table = req.query.table,
        geom = layer.geom,
        id = layer.qID || null,
        cat = req.query.cat || null,
        filter = req.params.filter;

        
      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string'
          && global.workspace.lookupValues.indexOf(val) < 0))) {
        return res.code(406).send(new Error('Invalid parameter.'));
      }
      

      // SQL filter
      const filter_sql = filter && await require(global.appRoot + '/mod/pg/sql_filter')(filter) || ' true';

      
      var q = `
      SELECT
        ${id} AS id,
        ${cat} AS cat,
        ST_asGeoJson(${geom}) AS geomj
      FROM ${req.query.table}
      WHERE ${filter_sql};`;

      var rows = await global.pg.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: JSON.parse(row.geomj),
        properties: {
          id: row.id,
          cat: row.cat
        }
      })));

    }
  });
};