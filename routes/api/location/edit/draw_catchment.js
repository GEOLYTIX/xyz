module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/location/edit/draw/catchment',
    beforeHandler: fastify.auth([fastify.authAPI]),
    handler: async(req, res) => {
      
      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace[token.access].config.locales[req.query.locale];

      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.query.layer];

      // Return 406 if layer is not found in locale.
      if (!layer) return res.code(406).send('Invalid layer.');

      const table = req.query.table;

      // Return 406 if table is not defined as request parameter.
      if (!table) return res.code(406).send('Missing table.');

      const params = {
        coordinates: req.query.coordinates,
        minutes: req.query.minutes,
        profile: req.query.profile
      };

      if (!params.coordinates) return res.code(406).send('Invalid coordinates.');

      let
        geom = layer.geom,
        geom_3857 = layer.geom_3857;

      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }
        
      const mapbox_isochrones = await require(global.appRoot + '/mod/mapbox_isochrones')(params);

      if(!mapbox_isochrones.features) return res.code(202).send('No catchment found within this time frame.');

      let geojson = JSON.stringify(mapbox_isochrones.features[0].geometry);

      let _geom;

      if (geom) _geom = `ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326)`;
      
      if (geom_3857) _geom = `ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326), 3857)`;

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