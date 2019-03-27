module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/location/select/latlng/nnearest',
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
          nnearest: { type: 'integer' },
          lat: { type: 'number' },
          lng: { type: 'number' },
          filter: { type: 'string' },
        },
        required: ['locale', 'layer', 'table', 'lat', 'lng']
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
        lat = req.query.lat,
        lng = req.query.lng,
        nnearest = parseInt(req.query.nnearest || 3),
        infoj = JSON.parse(JSON.stringify(layer.infoj)),
        geom = req.query.geom || layer.geom;
      
      // Return 406 if table does not have EPSG:4326 geometry field.
      if (!geom) return res.code(400).send(new Error('Missing geom (SRID 4326) field on layer.'));
  
      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string'
          && global.workspace.lookupValues.indexOf(val) < 0))) {
        return res.code(406).send(new Error('Invalid parameter.'));
      }
  
      // The fields array stores all fields to be queried for the location info.
      const fields = await require(global.appRoot + '/mod/pg/sql_fields')([], infoj);

      // Push JSON geometry field into fields array.
      fields.push(`\n   ST_asGeoJson(${geom}) AS geomj`);
  
      var q = `
        SELECT ${fields.join()}
        FROM ${table}
        ORDER BY ST_SetSRID(ST_Point(${lng}, ${lat}), 4326) <#> ${geom}
        LIMIT ${nnearest};`;
  
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