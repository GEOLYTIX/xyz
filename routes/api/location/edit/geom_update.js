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
        srid = req.query.srid,
        geom = layer.geom,
        geom_3857 = layer.geom_3857,
        geometry = req.body;

      let _geom;

      if(geom) _geom = `ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}'), 4326)`;

      if(geom_3857) _geom = `ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}'), 4326), 3857)`;

      if (srid === '3857') _geom = `ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}'), 3857)`;
    
      var q = `UPDATE ${table} SET ${geom || geom_3857} = ${_geom} WHERE ${layer.qID} = ${id};`;

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