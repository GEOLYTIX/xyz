const env = require('../../../mod/env');

const sql_filter = require('../../../mod/pg/sql_filter');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/layer/cluster',
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
          filter: { type: 'string' },
        },
        required: ['locale', 'layer', 'table']
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties : {
              type: { type: 'string' },
              geometry: {},
              properties: {},
            }
          }
        }
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      fastify.evalParam.geomTable,
      (req, res, next) => {
        fastify.evalParam.layerValues(req, res, next, ['cat']);
      },
    ],
    handler: async (req, res) => {
 
      let
        layer = req.params.layer,
        table = req.query.table,
        geom = layer.geom,
        cat = req.query.cat || null,
        size = req.query.size || 1,
        theme = req.query.theme,
        filter = req.params.filter,
        kmeans = parseInt(1 / req.query.kmeans),
        dbscan = parseFloat(req.query.dbscan),
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);
          

      // SQL filter
      const filter_sql = filter && await sql_filter(filter) || ''; 

      // Query the feature count from lat/lng bounding box.
      var q = `
      SELECT
        count(1)::integer,
        ST_Distance(
          ST_Point(
            ST_XMin(ST_Envelope(ST_Extent(${geom}))),
            ST_YMin(ST_Envelope(ST_Extent(${geom})))
          ),
          ST_Point(
            ST_XMax(ST_Envelope(ST_Extent(${geom}))),
            ST_Ymin(ST_Envelope(ST_Extent(${geom})))
          )
        ) AS xExtent,
        ST_Distance(
          ST_Point(${west}, ${south}),
          ST_Point(${east}, ${north})
        ) AS xEnvelope
      FROM ${table}
      WHERE
        ST_DWithin(
          ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
            ${geom},
            0.00001)
        ${filter_sql};`;
  
      var rows = await env.dbs[layer.dbs](q);
  
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  
      // return 202 if no locations found within the envelope.
      if (parseInt(rows[0].count) === 0) return res.code(200).send([]);
  
      let
        count = rows[0].count,
        xEnvelope = rows[0].xenvelope,
        kmeans_only;

      if (count > 1000) {
        kmeans *= 2;
        kmeans_only = true;
      }
  
      if (kmeans >= count) kmeans = count;
   
      dbscan *= xEnvelope;

      const kmeans_sql = `
      SELECT
        ${cat} AS cat,
        ${size} AS size,
        ${geom} AS geom,
        ST_ClusterKMeans(${geom}, ${kmeans}) OVER () kmeans_cid
        
      FROM ${table}
      WHERE
        ST_DWithin(
          ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
          ${geom},
          0.00001
        )
        ${filter_sql}`;

      const dbscan_sql = `
      SELECT
        cat,
        size,
        geom,
        kmeans_cid,
        ST_ClusterDBSCAN(geom, ${dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
      FROM (${kmeans_sql}) kmeans`;
 

      if (!theme) var q = `
      SELECT
        count(1) count,
        SUM(size) size,
        ST_AsGeoJson(ST_PointOnSurface(ST_Union(geom))) geomj

      FROM (${kmeans_only ? kmeans_sql : dbscan_sql}) dbscan GROUP BY kmeans_cid ${kmeans_only ? ';': ', dbscan_cid;'}`;


      if (theme === 'categorized') var q = `
      SELECT
        count(1) count,
        SUM(size) size,
        array_agg(cat) cat,
        ST_AsGeoJson(ST_PointOnSurface(ST_Union(geom))) geomj

      FROM (${kmeans_only ? kmeans_sql : dbscan_sql}) dbscan GROUP BY kmeans_cid ${kmeans_only ? ';': ', dbscan_cid;'};`;
  

      if (theme === 'graduated') var q = `
      SELECT
        count(1) count,
        SUM(size) size,
        ${req.query.aggregate || 'sum'}(cat) cat,
        ST_AsGeoJson(ST_PointOnSurface(ST_Union(geom))) geomj

      FROM (${kmeans_only ? kmeans_sql : dbscan_sql}) dbscan GROUP BY kmeans_cid ${kmeans_only ? ';': ', dbscan_cid;'}`;


      if (theme === 'competition') var q = `
      SELECT
        SUM(size) count,
        SUM(size) size,
        JSON_Agg(JSON_Build_Object(cat, size)) cat,
        ST_AsGeoJson(ST_PointOnSurface(ST_Union(geom))) geomj

      FROM (
        SELECT
          SUM(size) size,
          cat,
          ST_Union(geom) geom,
          kmeans_cid,
          dbscan_cid

        FROM (${dbscan_sql}) dbscan GROUP BY kmeans_cid, dbscan_cid, cat

      ) cluster GROUP BY kmeans_cid, dbscan_cid;`;
  
      
      var rows = await env.dbs[layer.dbs](q);
        
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  

      if (!theme) return res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: JSON.parse(row.geomj),
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size)
        }
      })));

      if (theme === 'categorized') return res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: JSON.parse(row.geomj),
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          cat: row.cat.length === 1? row.cat[0] : null
        }
      })));

      if (theme === 'graduated') return res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: JSON.parse(row.geomj),
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          cat: parseFloat(row.cat)
        }
      })));

      if (theme === 'competition') return res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: JSON.parse(row.geomj),
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          cat: Object.assign({}, ...row.cat)
        }
      })));

    }
  });
};