const env = require('../../../mod/env');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/table', 
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
          tableDef: { type: 'string' },
          id: { type: 'string' },
          filter: { type: 'string' }
        },
        required: ['locale', 'layer', 'tableDef', 'id']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      fastify.evalParam.tableDef
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        tableDef = req.params.tableDef;


      // Add first column for row titles.
      const lines = [`
      UNNEST(
        ARRAY['${tableDef.rows.map(row => row.title || row.field).join('\',\'')}']
      ) AS rows`];

      
      const withTable = [];

      tableDef.columns.forEach(col => {

        const rows = tableDef.rows.map(
          row => `(${row.fieldfx || row.field})::${col.type || 'text'} AS ${row.field}`
        );

        if(col.lookup){

          const arr = tableDef.rows.map(row => `${col.field}.${row.field}`);

          lines.push(`UNNEST(ARRAY[${arr.join(',')}]) AS ${col.field}`);

          withTable.push(`
          ${col.field} AS (
            SELECT ${rows.join(',')}
            FROM
              ${col.lookup.table_a} a,
              ${col.lookup.table_b} b
            WHERE a.${layer.qID} = $1
            AND
              ${col.lookup.condition ? col.lookup.condition : 'ST_INTERSECTS'}
              (a.${col.lookup.geom_a}, b.${col.lookup.geom_b})
          )`);
        }

        // include helper column to calculate from
        if(col.aspatial){

          withTable.push(`${col.field} AS (SELECT ${col.aspatial})`);
        }

      });


      Object.entries(tableDef.agg || {}).forEach(agg => {

        const fields = agg[1].rows.map(
          row => `(${row})::${agg[1].type || 'text'}`
        );

        lines.push(`UNNEST(ARRAY[${fields.join(',')}]) AS ${agg[0]}`);

      });

      const col_alias = tableDef.columns.map(col => col.field);


      var q = `
        WITH ${withTable.join(',')}
        SELECT ${lines.join(',')}
        FROM ${col_alias.join(',')};`;

      const rows = await env.dbs[layer.dbs](q, [req.query.id]);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);

    }
  });
};