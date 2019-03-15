module.exports = (fastify, authToken) => {
  fastify.route({
    method: 'GET',
    url: '/api/location/select/latlng/intersects',
    preHandler: fastify.auth([
      (req, res, done)=>authToken(req, res, done, { lv: global.access, API: true })
    ]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace['admin'].config.locales[req.query.locale];

      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.query.layer];

      // Return 406 if layer is not found in locale.
      if (!layer) return res.code(406).send('Invalid layer.');

      const table = req.query.table
        || layer.table
        || Object.values(layer.tables)[Object.values(layer.tables).length - 1]
        || Object.values(layer.tables)[Object.values(layer.tables).length - 2];
    
      // Clone the infoj from the memory workspace layer.
      const infoj = JSON.parse(JSON.stringify(layer.infoj));

      const geom = req.query.geom || layer.geom;

      // Return 406 if table does not have EPSG:4326 geometry field.
      if (!geom) return res.code(406).send('Missing geom (SRID 4326) field on layer.');
  
      const lat = parseFloat(req.query.lat);
      if (!lat) return res.code(406).send('Missing lat.');

      const lng = parseFloat(req.query.lng);
      if (!lng) return res.code(406).send('Missing lng.');      
   
      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace['admin'].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }
  
      // The fields array stores all fields to be queried for the location info.
      const fields = await require(global.appRoot + '/mod/pg/sql_fields')([], infoj, qID);

      // Push JSON geometry field into fields array.
      fields.push(`\n   ST_asGeoJson(${geom}) AS geomj`);
  
      var q = `
      WITH T AS (
          SELECT
          ${geom} AS _geom
          FROM ${table}
          WHERE ST_Contains(${geom}, ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))
          LIMIT 1
      )
      SELECT ${fields.join()} FROM ${table}, T
      WHERE ST_Intersects(${geom}, _geom);`;
  
      var rows = await global.pg.dbs[layer.dbs](q);
  
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // return 204 if no record was returned from database.
      if (rows.length === 0) return res.code(202).send('No rows returned from table.');
  
      // Iterate through the rows whereas each row is one location.
      rows.forEach(row => {

        // Iterate through infoj entries and assign values returned from query.
        infoj.forEach(entry =>  {
          if (row[entry.field]) entry.value = row[entry.field];
        });
        
      });
          
      // Send the infoj object with values back to the client.
      res.code(200).send(rows);

    }
  });
};