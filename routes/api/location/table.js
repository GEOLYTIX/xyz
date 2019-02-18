module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/table',
    beforeHandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace[token.access].config.locales[req.query.locale];

      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.query.layer];

      // Return 406 if layer is not found in locale.
      if (!layer) return res.code(406).send('Invalid layer.');

     
      // Clone the infoj from the memory workspace layer.
      const infoj = JSON.parse(JSON.stringify(layer.infoj));

      const cols = infoj[6].columns;

      let _with = [];

      let _row_queries = [];

      let _from = [];
    
      cols.forEach(col => {

        if (col.with) {

          _from.push(col.field);

          let _select = [];

          Object.entries(col.with.select).forEach(sel => {

            _select.push(`\n ${sel[1]} ${sel[0]}`);

          });

          _with.push(`${col.field} as (
            SELECT ${_select.join()}
            FROM ${col.with.from}
            ${ col.with.where ? 'WHERE ' + col.with.where : ''}) `);

        }

        let _rows = [];

        Object.entries(col.rows).forEach(row => {

          _rows.push(`${row[1]}`);

        });

        _row_queries.push(`unnest (array[${_rows.join()}]) as ${col.field} `);

      });

      let _q = `
      WITH
      ${_with.join()}
      
      SELECT
      ${_row_queries.join()}
      
      FROM
      ${_from.join()};`;

      console.log(_q);
        

      let q = `
            WITH

            min15 as (
                SELECT
                    sum(b.age18_24) age18_24,
                    sum(b.age25_44) age25_44,
                    sum(b.pop__17) total
                FROM
                    shepherd_neame.sites a,
                    gb_hx_1k b
                WHERE
                    a.id = 38
                    AND ST_INTERSECTS(a.isoline_15min, b.geomcntr)
                ),

            uk as (
                SELECT
                    b.age_18to24_uk as age18_24,
                    b.age_25to29_uk + b.age_30to44_uk as age25_44,
                    b.age_total_uk as total
                FROM
                    shepherd_neame.report_summary b
                )

            select

                unnest (array[
                    'age18_24',
                    'age25_44',
                    'total'
                    ]) as fields,

                unnest (array[
                    min15.age18_24,
                    min15.age25_44,
                    min15.total
                    ]) as min_15,

                unnest (array[
                    uk.age18_24,
                    uk.age25_44,
                    uk.total
                    ]) as uk,

                unnest (array[
                    min15.age18_24 / min15.total * 100,
                    min15.age25_44 / min15.total * 100,
                    min15.total / min15.total * 100
                    ]) as pct_15,

                unnest (array[
                    uk.age18_24 / uk.total * 100,
                    uk.age25_44 / uk.total * 100,
                    uk.total / uk.total * 100
                ]) as pct_uk,

                unnest (array[
                    (min15.age18_24 / min15.total) / (uk.age18_24 / uk.total) * 100,
                    (min15.age25_44 / min15.total) / (uk.age25_44 / uk.total) * 100,
                    (min15.total / min15.total) / (uk.total / uk.total) * 100
                    ]) as index

            from
                min15,
                uk;
      `;


      var rows = await global.pg.dbs['XYZ'](_q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);
    }
  });
};