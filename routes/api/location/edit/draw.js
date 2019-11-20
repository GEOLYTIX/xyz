const env = require('../../../../mod/env');

const mvt_cache = require('../../../../mod/mvt_cache');

module.exports = fastify => {

  fastify.route({
    method: 'POST',
    url: '/api/location/edit/draw',
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
          srid: { type: 'string' }
        },
        required: ['locale', 'layer', 'table']
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
        geometry = JSON.stringify(req.body.geometry),
        properties = req.body.properties;
          
      var q = `
      INSERT INTO ${table} (${layer.geom}${properties ? ',' + Object.keys(properties)[0] : ''})
      SELECT
        ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), ${layer.srid})
        ${properties ? ',\'' + Object.values(properties)[0] + '\'' : ''}
      RETURNING ${layer.qID} AS id;`;
      
      var rows = await env.dbs[layer.dbs](q);
      
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
    
      if (layer.mvt_cache) await mvt_cache(layer, table, rows[0].id);
      
      res.code(200).send(rows[0].id.toString());    

    }

  });
};