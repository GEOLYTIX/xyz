const env = require('../../../mod/env');

const sql_filter = require('../../../mod/pg/sql_filter');

module.exports = fastify => {
  
  fastify.route({
    method: 'GET',
    url: '/api/layer/count',
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
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        table = req.query.table,
        filter = req.params.filter;

      // SQL filter
      const filter_sql = filter && await sql_filter(filter) || '';
    
      // Query the estimated extent for the layer geometry field from layer table.
      rows = await env.dbs[layer.dbs](`
        SELECT count(1)
        FROM ${table}
        WHERE true ${filter_sql};
      `);
      
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');


      // Regex format bounds as comma separated string and return to client.
      res.code(200).send(rows[0].count);

    }
  });
};