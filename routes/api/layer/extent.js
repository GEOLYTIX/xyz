const env = require('../../../mod/env');

const sql_filter = require('../../../mod/pg/sql_filter');

module.exports = fastify => {
  
  fastify.route({
    method: 'GET',
    url: '/api/layer/extent',
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
          mapview_srid: { type: 'integer' }
        },
        required: ['locale', 'layer']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        filter = req.params.filter,
        mapview_srid = req.query.mapview_srid;

        
      // Get table entry from layer or min table in from tables array.
      const table = layer.table
        || Object.values(layer.tables)[0]
        || Object.values(layer.tables)[1];


      var geom = `Box2D(ST_Transform(ST_SetSRID(ST_Extent(${layer.geom}), ${layer.srid}), ${mapview_srid}))`;

      // SQL filter
      const filter_sql = filter && await sql_filter(filter) || '';

      // Query the estimated extent for the layer geometry field from layer table.
      var rows = await env.dbs[layer.dbs](`
        SELECT ${geom}
        FROM ${table}
        WHERE true ${filter_sql};
      `);
      
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // Get bounds from first row value.
      const bounds = Object.values(Object.values(rows)[0])[0];

      // Return 204 if bounds couldn't be formed.
      if (!bounds) return res.code(204).send('No bounds.');

      // Regex format bounds as comma separated string and return to client.
      res.code(200).send(/\((.*?)\)/.exec(bounds)[1].replace(/ /g, ','));

    }
  });
};