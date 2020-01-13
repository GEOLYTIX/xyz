const infoj_values = require('./infoj_values.js');

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
      
      const rows = await infoj_values({
        locale: req.params.locale,
        layer: req.params.layer,
        table: req.query.table,
        id: req.query.id,
        roles: req.params.token.roles || []
      })

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // return 204 if no record was returned from database.
      if (rows.length === 0) return res.code(202).send('No rows returned from table.');
    
      // Send the infoj object with values back to the client.
      res.code(200).send(rows[0]);

    }
  });
};