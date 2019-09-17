const env = require('../../../../mod/env');

const fetch = require('../../../../mod/fetch');

const mvt_cache = require('../../../../mod/mvt_cache');

const sql_fields = require('../../../../mod/pg/sql_fields');

const date = require('../../../../mod/date.js');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/edit/isoline/here',
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
    handler: async (req, res) => {

      const params = {
        coordinates: req.query.coordinates,
        mode: req.query.mode || 'car',
        type: req.query.type || 'fastest', //'shortest'
        rangetype: req.query.rangetype || 'time',
        traffic: 'traffic:disabled'
      };

      params.range = params.rangetype === 'time' ?
        req.query.minutes * 60 || 600 :
        params.rangetype === 'distance' ?
          req.query.distance * 1000 || 1000 :
          600;


      var q = `https://isoline.route.api.here.com/routing/7.2/calculateisoline.json?${env.keys.HERE}&mode=${params.type};${params.mode};${params.traffic}&start=geo!${params.coordinates}&range=${params.range}&rangetype=${params.rangetype}`;

      // Fetch results from Google maps places API.
      const here_isolines = await fetch(q);

      if (!here_isolines.response
        || !here_isolines.response.isoline
        || !here_isolines.response.isoline[0].component) return res.code(202).send({
        'msg': 'No isoline found within this range.',
        'res': here_isolines
      });

      const _geojson = {
        'type': 'Polygon',
        'coordinates': [[]]
      };

      here_isolines.response
        .isoline[0].component[0].shape.forEach(el => {
          el = el.split(',');
          _geojson.coordinates[0].push(el.reverse());
        });

      const geojson = JSON.stringify(_geojson);
      
      var meta_json;

      if(req.query.meta) meta_json = {
        'Recent isoline': 'Here',
        'Mode': params.mode,
        'Range type': params.rangetype,
        'Range': req.query.minutes ||req.query.distance,
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
          SET ${req.query.field} = ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326), ${layer.srid})
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
        infoj.forEach(entry => {
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