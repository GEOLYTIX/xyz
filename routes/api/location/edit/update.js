const env = require('../../../../mod/env');

const sql_infoj = require('../../../../mod/pg/sql_infoj');

const mvt_cache = require('../../../../mod/mvt_cache');

const sql_fields = require('../../../../mod/pg/sql_fields');

module.exports = fastify => {

  fastify.route({
    method: 'POST',
    url: '/api/location/edit/update',
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
        qID = layer.qID,
        id = req.query.id,
        infoj = req.body.infoj;

      let fields = await sql_infoj(infoj);

      var q = `UPDATE ${table} SET ${fields} WHERE ${qID} = $1;`;

      var rows = await env.dbs[layer.dbs](q, [id]);

      if (rows.err) return res.code(500).send('PostgreSQL query error - please check backend logs.');
      
      // Remove tiles from mvt_cache.
      if (layer.mvt_cache) await mvt_cache(layer, table, id);


      // Get the updated infoj.


      // Query field for updated infoj
      infoj = JSON.parse(JSON.stringify(layer.infoj));

      // The fields array stores all fields to be queried for the location info.
      fields = await sql_fields([], infoj, qID);

      var q = `
        SELECT ${fields.join()}
        FROM ${table}
        WHERE ${qID} = $1;`;

      var rows = await env.dbs[layer.dbs](q, [id]);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
   
      // Send the infoj object with values back to the client.
      res.code(200).send(rows[0]);

    }
    
  });
};