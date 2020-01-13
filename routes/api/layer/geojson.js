const env = require('../../../mod/env');

const sql_filter = require('../../../mod/pg/sql_filter');

module.exports = fastify => {
  
  fastify.route({
    method: 'GET',
    url: '/api/layer/geojson',
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
      fastify.evalParam.geomTable,
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        geom = layer.geom,
        id = layer.qID || null,
        cat = req.query.cat || null,
        filter = req.params.filter;     

      // SQL filter
      const filter_sql = filter && await sql_filter(filter) || ' true';

      
      var q = `
      SELECT
        ${id} AS id,
        ${cat} AS cat,
        ST_asGeoJson(${geom}) AS geomj
      FROM ${req.query.table}
      WHERE ${filter_sql};`;

      var rows = await env.dbs[layer.dbs](q);

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