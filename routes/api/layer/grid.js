const env = require('../../../mod/env');

module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/layer/grid',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
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
      fastify.evalParam.geomTable,
      (req, res, next) => {
        fastify.evalParam.layerValues(req, res, next, ['size','color']);
      },
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        table = req.query.table,
        geom = layer.geom,
        size = req.query.size,
        color = req.query.color,
        srid = layer.srid,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);

      
      var q = `
      SELECT
          ST_X(ST_Transform(${layer.geom},${srid})) x,
          ST_Y(ST_Transform(${layer.geom},${srid})) y,
          ${size} size,
          ${color} color
      FROM ${table}
      WHERE
          ST_DWithin(
              ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, ${srid}),
              ${geom}, 0.000001)
          AND ${size} >= 1 LIMIT 10000;`;


      var rows = await env.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      if (rows.length === 0) return res.code(204).send();

      res.code(200).send(rows.map(row => {
        return Object.keys(row).map(field => row[field]);
      }));

    }
  });
};