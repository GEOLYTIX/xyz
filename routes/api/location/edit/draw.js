module.exports = fastify => {
  fastify.route({
    method: 'POST',
    url: '/api/location/edit/draw',
    preHandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace[token.access].config.locales[req.body.locale];

      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.body.layer];

      if (!layer) return res.code(406).send('Layer not found.');

      let
        table = req.body.table,
        geom = layer.geom,
        geom_3857 = layer.geom_3857,
        geometry = JSON.stringify(req.body.geometry);
      
        // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
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