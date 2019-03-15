module.exports = (fastify, authToken) => {
  fastify.route({
    method: 'GET',
    url: '/api/location/edit/isoline/mapbox',
    preHandler: fastify.auth([
      (req, res, done)=>authToken(req, res, done, { lv: global.access, API: true })
    ]),
    handler: async(req, res) => {
      
      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace['admin'].config.locales[req.query.locale];

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
        minutes: req.query.minutes || 10,
        profile: req.query.profile || 'driving',
      };

      if (!params.coordinates) return res.code(406).send('Invalid coordinates.');

      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace['admin'].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }
         
      var q = `https://api.mapbox.com/isochrone/v1/mapbox/${params.profile}/${params.coordinates}?contours_minutes=${params.minutes}&generalize=${params.minutes}&polygons=true&${global.KEYS.MAPBOX}`;
      
      // console.log(q);

      // Fetch results from Google maps places API.
      const mapbox_isolines = await require(global.appRoot + '/mod/fetch')(q);
  
      if(!mapbox_isolines.features) return res.code(202).send('No catchment found within this time frame.');

      const geojson = JSON.stringify(mapbox_isolines.features[0].geometry);

      if (req.query.id) {

        // Check whether string params are found in the settings to prevent SQL injections.
        if ([req.query.field]
          .some(val => (typeof val === 'string' && val.length > 0 && global.workspace['admin'].values.indexOf(val) < 0))) {
          return res.code(406).send('Invalid parameter.');
        }

        var q = `
        UPDATE ${table}
        SET ${req.query.field} = ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326)
        WHERE ${layer.qID} = $1;`;

        var rows = await global.pg.dbs[layer.dbs](q, [req.query.id]);
  
        if (rows.err) return res.code(500).send('PostgreSQL query error - please check backend logs.');
  
        // Query field for updated infoj
        const infoj = JSON.parse(JSON.stringify(layer.infoj));
  
        // The fields array stores all fields to be queried for the location info.
        fields = await require(global.appRoot + '/mod/pg/sql_fields')([], infoj, layer.qID);
  
        var q = `
        SELECT ${fields.join()}
        FROM ${table}
        WHERE ${layer.qID} = $1;`;
  
        var rows = await global.pg.dbs[layer.dbs](q, [req.query.id]);
  
        if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  
        // Iterate through infoj entries and assign values returned from query.
        infoj.forEach(entry =>  {
          if (rows[0][entry.field]) entry.value = rows[0][entry.field];
        });
  
        // Send the infoj object with values back to the client.
        return res.code(200).send(infoj);

      }

      const geom = layer.geom ?
        `ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326)` :
        `ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326), 3857)`;

      var q = `
      INSERT INTO ${table} (${layer.geom || layer.geom_3857})
      SELECT ${geom}
      RETURNING ${layer.qID} AS id;`;
      
      var rows = await global.pg.dbs[layer.dbs](q);
      
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
      
      if (layer.mvt_cache) await require(global.appRoot + '/mod/mvt_cache')(layer, table, rows[0].id);
      
      res.code(200).send(rows[0].id.toString());   
      
    }
  });
};