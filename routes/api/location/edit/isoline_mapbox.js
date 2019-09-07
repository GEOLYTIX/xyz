const env = require('../../../../mod/env');

const fetch = require('../../../../mod/fetch');

const mvt_cache = require('../../../../mod/mvt_cache');

const sql_fields = require('../../../../mod/pg/sql_fields');

const date = require('../../../../mod/date.js');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/edit/isoline/mapbox',
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
          meta: { type: 'string' },
          coordinates: { type: 'string' },
        },
        required: ['coordinates']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      // fastify.evalParam.locale,
      // fastify.evalParam.layer,
      // fastify.evalParam.roles,
      // (req, res, next) => {
      //   fastify.evalParam.layerValues(req, res, next, ['table', 'field']);
      // },
    ],
    handler: async(req, res) => {
      
      const params = {
        coordinates: req.query.coordinates,
        minutes: req.query.minutes || 10,
        profile: req.query.profile || 'driving',
      };
         
      var q = `https://api.mapbox.com/isochrone/v1/mapbox/${params.profile}/${params.coordinates}?contours_minutes=${params.minutes}&generalize=${params.minutes}&polygons=true&${env.keys.MAPBOX}`;
      
      // Fetch results from Google maps places API.
      const mapbox_isolines = await fetch(q);
  
      if(!mapbox_isolines.features) return res.code(202).send('No catchment found within this time frame.');

      const geojson = JSON.stringify(mapbox_isolines.features[0].geometry);

      var meta_json;

      if(req.query.meta) meta_json = {
        'Recent isoline': 'Mapbox',
        'Mode': params.profile,
        'Minutes': params.minutes,
        'Created': date()
      };

      let
        layer = req.params.layer,
        table = req.query.table;

      if (!layer || !table) return res.code(200).send(geojson); 

      // Overwrite existing geometry.
      if (req.query.id) {

        var q = `
        UPDATE ${table}
        SET ${req.query.field} = ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326)
        ${req.query.meta ? `, ${req.query.meta} = '${JSON.stringify(meta_json)}'` : ''}
        WHERE ${layer.qID} = $1;`;

        var rows = await env.dbs[layer.dbs](q, [req.query.id]);
  
        if (rows.err) return res.code(500).send('PostgreSQL query error - please check backend logs.');
  
        // Query field for updated infoj
        const infoj = JSON.parse(JSON.stringify(layer.infoj));
  
        // The fields array stores all fields to be queried for the location info.
        fields = await sql_fields([], infoj, layer.qID);
  
        var q = `
          SELECT ${fields.join()}
          FROM ${table}
          WHERE ${layer.qID} = $1;`;
  
        var rows = await env.dbs[layer.dbs](q, [req.query.id]);
  
        if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  
        // Iterate through infoj entries and assign values returned from query.
        infoj.forEach(entry =>  {
          if (rows[0][entry.field]) entry.value = rows[0][entry.field];
        });
  
        // Send the infoj object with values back to the client.
        return res.code(200).send(infoj);

      }

      var q = `
      INSERT INTO ${table} (${layer.geom})
      SELECT ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326), ${layer.srid})
      RETURNING ${layer.qID} AS id;`;
      
      var rows = await env.dbs[layer.dbs](q);
      
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
      
      if (layer.mvt_cache) await mvt_cache(layer, table, rows[0].id);
      
      res.code(200).send(rows[0].id.toString());   
      
    }
    
  });
};