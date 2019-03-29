module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/field/range',
    preValidation: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, {
        public: global.public
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
        },
        required: ['locale', 'layer', 'table', 'field']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      (req, res, next) => {
        fastify.evalParam.layerValues(req, res, next, ['table', 'field']);
      },
    ],
    handler: async (req, res) => {
        
      let
        layer = req.params.layer,
        table = req.query.table,
        field = req.query.field;
           
      var q = `
      SELECT min(${field}), max(${field})
      FROM ${table};`;
  
      var rows = await global.pg.dbs[layer.dbs](q);
  
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  
      // return 204 if no record was returned from database.
      if (rows.length === 0) return res.code(202).send('No rows returned from table.');
       
      // Send the infoj object with values back to the client.
      res.code(200).send({
        min: rows[0].min,
        max: rows[0].max
      });
  
    }
    
  });
};