const env = require('../../../../mod/env');

const mvt_cache = require('../../../../mod/mvt_cache');

module.exports = fastify => {

  fastify.route({
    method: 'POST',
    url: '/api/location/edit/geom/update',
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
          id: { type: 'string' }
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
        srid = layer.srid,
        geom = layer.geom,
        geometry = req.body;

      var q = `
      UPDATE ${table}
      SET ${geom} = ST_SetSRID(
        ST_GeomFromGeoJSON('${JSON.stringify(geometry)}')
        , ${srid})
      WHERE ${layer.qID} = ${id};`;

      // delete old geometry from cache
      if (layer.mvt_cache) await mvt_cache(layer, table, id);
      
      var rows = await env.dbs[layer.dbs](q);
      
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
      
      // delete new geometry from cache
      if (layer.mvt_cache) await mvt_cache(layer, table, id);
      
      res.code(200).send();

    }

  });
};