module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/table', 
    prehandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace[token.access].config.locales[req.query.locale];

      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.query.layer];

      // Return 406 if layer is not found in locale.
      if (!layer) return res.code(406).send('Invalid layer.');

      var id = req.query.id;

      // Get table definition from layer infoj.
      const tableDef = layer.infoj.find(
        entry => entry.title === decodeURIComponent(req.query.tableDef)
      );


      if (!tableDef) return res.code(406).send('Missing table definition.');


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
            WHERE a.${layer.qID} = ${id}
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

      var _rows = await global.pg.dbs[layer.dbs](q);

      if (_rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(_rows);

    }
  });
};