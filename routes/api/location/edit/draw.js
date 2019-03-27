module.exports = fastify => {

  fastify.route({
    method: 'POST',
    url: '/api/location/edit/draw',
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
        geom = layer.geom,
        geom_3857 = layer.geom_3857,
        geometry = JSON.stringify(req.body.geometry);
      
      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string'
          && global.workspace.lookupValues.indexOf(val) < 0))) {
        return res.code(406).send(new Error('Invalid parameter.'));
      }
      
      // const d = new Date();
      
      let _geom;

      if (geom) _geom = `ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), 4326)`;
      
      if (geom_3857) _geom = `ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), 4326), 3857)`;

      var q = `
      INSERT INTO ${table} (${geom || geom_3857})
      SELECT ${_geom}
      RETURNING ${layer.qID} AS id;`;
      
      var rows = await global.pg.dbs[layer.dbs](q);
      
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
    
      if (layer.mvt_cache) await require(global.appRoot + '/mod/mvt_cache')(layer, table, rows[0].id);
      
      res.code(200).send(rows[0].id.toString());    

    }

  });
};