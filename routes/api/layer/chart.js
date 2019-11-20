const env = require('../../../mod/env');

const sql_filter = require('../../../mod/pg/sql_filter');

const sql_fields = require('../../../mod/pg/sql_fields');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/layer/chart',
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
          chart: { type: 'string' },
          filter: { type: 'string' },
          mapview_srid: { type: 'integer' }
        },
        required: ['locale', 'layer', 'chart']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      fastify.evalParam.layerChart
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        chart = req.params.chart,
        viewport = req.query.viewport,
        filter = req.params.filter,
        orderby = req.query.orderby || layer.qID,
        order = req.query.order || 'ASC',
        mapview_srid = req.query.mapview_srid,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north),
        viewport_sql = 'WHERE true ';

      if(viewport){

        viewport_sql = `
        WHERE
          ST_DWithin(
            ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, ${mapview_srid}),
            ${layer.geom},
            0.00001)
        `;
      
      }      

      // SQL filter
      const filter_sql = filter && await sql_filter(filter) || '';

      const fields = await sql_fields([], chart.columns);
      
      var q = `
        SELECT
          ${layer.qID} AS qID,
          ${fields}
        FROM ${chart.from}
        ${viewport_sql}
        ${filter_sql}
        ORDER BY ${orderby} ${order}
        FETCH FIRST 99 ROW ONLY;`;

      var rows = await env.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);
    }

  });
};