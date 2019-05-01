const env = require('../../../mod/env');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/field',
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
          field: { type: 'string' },
          id: { type: 'string' },
        },
        required: ['locale', 'layer', 'table', 'field', 'id']
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
        field = req.query.field,
        id = req.query.id,
        qID = layer.qID;
           
      var q = `
      SELECT ${field}
      FROM ${table}
      WHERE ${qID} = $1;`;
  
      var rows = await env.dbs[layer.dbs](q, [id]);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // return 204 if no record was returned from database.
      if (rows.length === 0) return res.code(202).send('No rows returned from table.');
        
      // Send the infoj object with values back to the client.
      res.code(200).send({
        field: rows[0][field]
      });
  
    }
    
  });
};