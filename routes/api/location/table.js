module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/table',
    beforeHandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {

      const cols = {
        rows: {
          rows:{
            age18_24: '\'age18_24\'',
            age25_44: '\'age25_44\'',
            total: '\'total\'',
          },
        },
        min15: {
          with: {
            select: {
              age18_24: 'sum(b.age18_24)',
              age25_44: 'sum(b.age25_44)',
              total: 'sum(b.pop__17)',
            },
            from: 'shepherd_neame.sites a, gb_hx_1k b',
            where: 'a.id = 38 AND ST_INTERSECTS(a.isoline_15min, b.geomcntr)'
          },
          rows: {
            age18_24: 'min15.age18_24',
            age25_44: 'min15.age25_44',
            total: 'min15.total',
          },
        },
        uk: {
          with: {
            select: {
              age18_24: 'age_18to24_uk',
              age25_44: 'age_25to29_uk + age_30to44_uk',
              total: 'age_total_uk',
            },
            from: 'shepherd_neame.report_summary',
          },
          rows: {
            age18_24: 'uk.age18_24',
            age25_44: 'uk.age25_44',
            total: 'uk.total',
          },
        },
        pct_15: {
          rows: {
            age18_24: 'min15.age18_24 / min15.total * 100',
            age25_44: 'min15.age25_44 / min15.total * 100',
            total: 'min15.total / min15.total * 100',
          },
        },
        pct_uk: {
          rows: {
            age18_24: 'uk.age18_24 / uk.total * 100',
            age25_44: 'uk.age25_44 / uk.total * 100',
            total: 'uk.total / uk.total * 100',
          },
        },
        index: {
          rows: {
            age18_24: '(min15.age18_24 / min15.total) / (uk.age18_24 / uk.total) * 100',
            age25_44: '(min15.age25_44 / min15.total) / (uk.age25_44 / uk.total) * 100',
            total: '(min15.total / min15.total) / (uk.total / uk.total) * 100',
          },
        }
      };

      let _with = [];

      let _row_queries = [];

      let _from = [];
    
      Object.entries(cols).forEach(col => {

        if (col[1].with) {

          _from.push(col[0]);

          let _select = [];

          Object.entries(col[1].with.select).forEach(sel => {

            _select.push(`\n ${sel[1]} ${sel[0]}`);

          });

          _with.push(`${col[0]} as (
            SELECT ${_select.join()}
            FROM ${col[1].with.from}
            ${ col[1].with.where ? 'WHERE ' + col[1].with.where : ''}) `);

        }

        let _rows = [];

        Object.entries(col[1].rows).forEach(row => {

          _rows.push(`${row[1]}`);

        });

        _row_queries.push(`unnest (array[${_rows.join()}]) as ${col[0]} `);

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