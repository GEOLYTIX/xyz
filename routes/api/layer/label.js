const env = require('../../../mod/env');

const sql_filter = require('../../../mod/pg/sql_filter');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/layer/label',
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
      filter: { type: 'string' }
        },
        required: ['locale', 'layer', 'table']
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties : {
              type: { type: 'string' },
              geometry: {},
              properties: {},
            }
          }
        }
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      fastify.evalParam.geomTable
    ],
    handler: async (req, res) => {
 
      let
        layer = req.params.layer,
        table = req.query.table,
        geom = layer.geom,
        label = req.query.label,
        filter = req.params.filter,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);         


      // Combine filter with envelope
      const where_sql =  `
      WHERE ST_DWithin(
        ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, ${parseInt(layer.srid)}),
        ${geom}, 0.00001)
        ${filter && await sql_filter(filter) || ''}`;



      var q = `
        SELECT
          ${label} AS label,
          ST_X(ST_PointOnSurface(${geom})) AS x,
          ST_Y(ST_PointOnSurface(${geom})) AS y
        FROM ${table} ${where_sql}`;

      console.log(q);


      var rows = await env.dbs[layer.dbs](q);
        
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  

      return res.code(200).send(rows.map(row => ({
        geometry: {
          x: row.x,
          y: row.y,
        },
        properties: {
          label: row.label
        }
      })));

    }
  });
};