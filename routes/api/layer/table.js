const env = require('../../../mod/env');

const sql_filter = require('../../../mod/pg/sql_filter');

const sql_fields = require('../../../mod/pg/sql_fields');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/layer/table',
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
      fastify.evalParam.layerTable,
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        table = req.params.table,
        viewport = req.query.viewport,
        filter = req.params.filter,
        orderby = req.query.orderby || layer.qID,
        order = req.query.order || 'asc',
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north),
        viewport_sql = 'WHERE true ';


      if (viewport && layer.geom) {

        viewport_sql = `
        WHERE
          ST_DWithin(
            ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
            ${layer.geom},
            0.00001)`;
      }

      if (viewport && layer.geom_3857) {

        viewport_sql = `
        WHERE
          ST_DWithin(
            ST_Transform(
              ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
              3857),
            ${layer.geom_3857},
            0.00001)`;
      }
             

      // SQL filter
      const filter_sql = filter && await sql_filter(filter) || '';

      const fields = [];

      const laterals = [];

      await table.columns.forEach(async col => {

        if (col.lateral) {

          fields.push(`${col.field}.${col.field} AS ${col.field}`);

          laterals.push(`
          LEFT JOIN LATERAL (
            SELECT ${col.lateral.select} AS ${col.field}
            FROM ${col.lateral.from}
            WHERE ${col.lateral.where}) ${col.field} ON true`);

          return;
        }

        if (col.field) return fields.push(`${col.fieldfx || col.field} AS ${col.field}`);

      });
      
      var q = `
        SELECT
          ${layer.qID} AS qID,
          ${fields.join()}
        FROM
          ${table.from}
          ${laterals.join(' ')}

        ${viewport_sql}
        ${filter_sql}
        ORDER BY ${orderby} ${order}
        FETCH FIRST 99 ROW ONLY;`;

      // OFFSET ${offset} ROWS

      var rows = await env.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);
    }

  });
};