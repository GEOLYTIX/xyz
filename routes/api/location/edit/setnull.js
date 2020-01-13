const env = require('../../../../mod/env');

const sql_fields = require('../../../../mod/pg/sql_fields');

const infoj_values = require('../select/infoj_values.js');

module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/location/edit/field/setnull',
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
          id: { type: 'string' },
          fields: { type: 'string' }
        },
        required: ['locale', 'layer', 'table', 'id', 'fields']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      (req, res, next) => {
        fastify.evalParam.layerValues(req, res, next, ['table', req.query.fields.split(',')]);
      },
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        table = req.query.table,
        qID = layer.qID,
        id = req.query.id,
        fields = req.query.fields.split(',');

        fields = fields.filter(f => { // filter out empty elements
          return !!f;
        });

        fields = fields.map(f => {
          return `${f}=NULL`;
        });
  
      var q = `
      UPDATE ${table}
        SET ${fields.join(',')}
      WHERE ${qID} = $1;`;
  
      var rows = await env.dbs[layer.dbs](q, [id]);
  
      if (rows.err) return res.code(500).send('Failed to update PostGIS table.');
  
			var rows = await infoj_values({
				locale: req.query.locale,
				layer: layer,
				table: table,
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