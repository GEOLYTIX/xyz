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
        label = req.query.label,
        filter = req.params.filter,
        kmeans = parseInt(1 / req.query.kmeans),
        dbscan = parseFloat(req.query.dbscan),
        resolution = parseFloat(req.query.resolution),
        srid = req.query.srid,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);
         

      // SQL filter
      const filter_sql = filter && await sql_filter(filter) || '';


      const where_sql = `
      WHERE ST_DWithin(
        ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, ${srid}),
        ${geom},
        0.00001
      ) ${filter_sql}`;

      // Get cross distance and count required for kmeans or dbscan clustering.
      if (kmeans || dbscan) {

        var q = `
        SELECT
          count(1)::integer,
          ST_Distance(
            ST_Point(${west}, ${south}),
            ST_Point(${east}, ${north})
          ) AS xdistance
        FROM ${table} ${where_sql}`;

        var rows = await env.dbs[layer.dbs](q);
          
        if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
          
        // return if no locations found within the envelope.
        if (parseInt(rows[0].count) === 0) return res.code(200).send([]);
          
        if (kmeans >= rows[0].count) kmeans = rows[0].count;
        
        var xdistance = rows[0].xdistance;
      }


      if (kmeans) {
        var kmeans_sql = `
        SELECT
          ${cat} AS cat,
          ${size} AS size,
          ${geom} AS geom,
          ${label} AS label,
          ST_ClusterKMeans(${geom}, ${kmeans}) OVER () kmeans_cid
          
        FROM ${table} ${where_sql}`;
      }

      if (resolution) {

        let r = parseInt(40075016.68 / Math.pow(2, req.query.z) * resolution);

        var agg_sql = `
        SELECT
          ${cat} AS cat,
          ${size} AS size,
          ST_X(${geom}) AS x_3857,
          ST_Y(${geom}) AS y_3857,
          round(ST_X(${geom}) / ${r}) * ${r} x_round,
          round(ST_Y(${geom}) / ${r}) * ${r} y_round
          
        FROM ${table} ${where_sql}`;
        
        if (!theme) var q = `
        SELECT
          count(1) count,
          SUM(size) size,
          percentile_disc(0.5) WITHIN GROUP (ORDER BY x_3857) x,
          percentile_disc(0.5) WITHIN GROUP (ORDER BY y_3857) y,
          x_round,
          y_round
  
        FROM (${agg_sql}) agg_sql GROUP BY x_round, y_round`;
  
  
        if (theme === 'categorized') var q = `
        SELECT
          count(1) count,
          SUM(size) size,
          array_agg(cat) cat,
          percentile_disc(0.5) WITHIN GROUP (ORDER BY x_3857) x,
          percentile_disc(0.5) WITHIN GROUP (ORDER BY y_3857) y,
          x_round,
          y_round
  
          FROM (${agg_sql}) agg_sql GROUP BY x_round, y_round`;
    
  
        if (theme === 'graduated') var q = `
        SELECT
          count(1) count,
          SUM(size) size,
          ${req.query.aggregate || 'sum'}(cat) cat,
          percentile_disc(0.5) WITHIN GROUP (ORDER BY x_3857) x,
          percentile_disc(0.5) WITHIN GROUP (ORDER BY y_3857) y,
          x_round,
          y_round
  
          FROM (${agg_sql}) agg_sql GROUP BY x_round, y_round`;
     

      } else {

        if (theme === 'categorized') var q = `
        SELECT
          count(1) AS count,
          SUM(size) AS size,
          array_agg(cat) cat,
          (array_agg(label))[1] AS label,
          ST_X(ST_PointOnSurface(ST_Union(geom))) AS x,
          ST_Y(ST_PointOnSurface(ST_Union(geom))) AS y
  
        FROM (${kmeans_sql}) dbscan GROUP BY kmeans_cid;`;        
      }
 


  
      
      var rows = await env.dbs[layer.dbs](q);
        
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  

      if (!theme) return res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: {
          [srid === '4326' ? 'lon' : 'x']: row.x,
          [srid === '4326' ? 'lat' : 'y']: row.y,
        },
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size)
        }
      })));

      if (theme === 'categorized') return res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: {
          [srid === '4326' ? 'lon' : 'x']: row.x,
          [srid === '4326' ? 'lat' : 'y']: row.y,
        },
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          cat: row.cat.length === 1? row.cat[0] : null,
          label: row.label,
        }
      })));

      if (theme === 'graduated') return res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: {
          [srid === '4326' ? 'lon' : 'x']: row.x,
          [srid === '4326' ? 'lat' : 'y']: row.y,
        },
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          cat: parseFloat(row.cat)
        }
      })));

    }
  });
};