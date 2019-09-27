const env = require('../../../../mod/env');

const sql_filter = require('../../../../mod/pg/sql_filter');

const sql_fields = require('../../../../mod/pg/sql_fields');

module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/location/select/aggregate',
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
    ],
    handler: async (req, res) => {
    
      let
        layer = req.params.layer,
        table = req.query.table,
        filter = req.params.filter;

      const geom_extent = `ST_Transform(ST_SetSRID(ST_Extent(${layer.geom}), ${layer.srid}), 4326)`

      // SQL filter
      const filter_sql = filter && await sql_filter(filter) || '';

      const infoj = layer.filter.infoj;

      // The fields array stores all fields to be queried for the location info.
      const fields = await sql_fields([], infoj);

      
      var q = `
      SELECT
        ST_asGeoJson(
        ST_Transform(
            ST_SetSRID(
                ST_Buffer(
                    ST_Transform(
                        ST_SetSRID(
                            ${geom_extent},
                            4326
                        ),
                        3857
                    ),
                    ST_Distance(
                        ST_Transform(
                            ST_SetSRID(
                                ST_Point(
                                    ST_XMin(ST_Envelope(${geom_extent})),
                                    ST_YMin(ST_Envelope(${geom_extent}))
                                ),
                                4326
                            ),
                            3857
                        ),
                        ST_Transform(
                            ST_SetSRID(
                                ST_Point(
                                    ST_XMax(ST_Envelope(${geom_extent})),
                                    ST_Ymin(ST_Envelope(${geom_extent}))
                                ),
                                4326
                            ),
                            3857
                        )
                    ) * 0.1
                ),
                3857
            ),
            ${layer.srid}
        )) AS geomj,
        ${fields.join()}
        FROM ${table}
        WHERE true ${filter_sql};`;
      
      var rows = await env.dbs[layer.dbs](q);
      
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // Iterate through infoj entries and assign values returned from query.
      infoj.forEach(entry => {
        if (rows[0][entry.field]) entry.value = rows[0][entry.field];
      });
      
      // Send the infoj object with values back to the client.
      res.code(200).send({
        geomj: rows[0].geomj,
        infoj: infoj
      });

    }
  });
};