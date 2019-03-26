module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/layer/grid',
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
        size = req.query.size,
        color = req.query.color,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);


      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table, geom, size, color]
        .some(val => (typeof val === 'string'
          && global.workspace.lookupValues.indexOf(val) < 0))) {
        return res.code(406).send(new Error('Invalid parameter.'));
      }

      
      var q = `
      SELECT
          ST_X(${layer.geom}) lon,
          ST_Y(${layer.geom}) lat,
          ${size} size,
          ${color} color
      FROM ${table}
      WHERE
          ST_DWithin(
              ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
              ${geom}, 0.000001)
          AND ${size} >= 1 LIMIT 10000;`;


      var rows = await global.pg.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      if (rows.length === 0) return res.code(204).send();

      res.code(200).send(rows.map(row => {
        return Object.keys(row).map(field => row[field]);
      }));

    }
  });
};