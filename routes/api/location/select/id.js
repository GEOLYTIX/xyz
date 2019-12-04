const env = require('../../../../mod/env');

const sql_fields = require('../../../../mod/pg/sql_fields');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/select/id',
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
          id: { type: 'string' },
        },
        required: ['locale', 'layer', 'table', 'id']
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
        table = req.query.table,
        id = req.query.id,
        qID = layer.qID;
      
      // Clone the infoj from the memory workspace layer.
      let infoj = layer.infoj && JSON.parse(JSON.stringify(layer.infoj));

      // The fields array stores all fields to be queried for the location info.    
      const fields = (infoj && await sql_fields([], infoj, qID, req.params.token.roles || [], req.params.locale)) || [];

      // Push JSON geometry field into fields array.
      fields.push(`\n   ST_asGeoJson(${layer.geom},4) AS geomj`);

      fields.push(`\n   ARRAY[ST_X(ST_PointOnSurface(${layer.geom})), ST_Y(ST_PointOnSurface(${layer.geom}))] AS PointOnSurface`);

      var q = `
        SELECT ${fields.join()}
        FROM ${table}
        WHERE ${qID} = $1`;

      var rows = await env.dbs[layer.dbs](q, [id]);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // return 204 if no record was returned from database.
      if (rows.length === 0) return res.code(202).send('No rows returned from table.');
    
      // Send the infoj object with values back to the client.
      res.code(200).send(rows[0]);

    }
  });
};