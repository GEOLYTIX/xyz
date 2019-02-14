module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/table',
    beforeHandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {

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


      var rows = await global.pg.dbs['XYZ'](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);
    }
  });
};