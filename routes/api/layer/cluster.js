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
      filter: { type: 'string' }
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
        pixelRatio = parseFloat(req.query.pixelRatio),
        kmeans = parseInt(1 / req.query.kmeans),
        dbscan = parseFloat(req.query.dbscan),
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);         


      // Combine filter with envelope
      const where_sql =  `
      WHERE ST_DWithin(
        ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, ${parseInt(layer.srid)}),
        ${geom}, 0.00001)
        ${filter && await sql_filter(filter) || ''}`;

      // Apply KMeans cluster algorithm.
      if (kmeans) {

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
      

        // KMeans cluster algorithm
        var cluster_sql = `
        (SELECT
          ${cat} AS cat,
          ${size} AS size,
          ${geom} AS geom,
          ${label && label !== 'count' ? label + ' AS label,' : ''}
          ST_ClusterKMeans(${geom}, ${kmeans}) OVER () kmeans_cid
          
        FROM ${table} ${where_sql}) kmeans`;


        // Apply nested DBScan cluster algorithm.
        if (dbscan) {

          dbscan *= rows[0].xdistance;

          cluster_sql = `
          (SELECT
            cat,
            size,
            geom,
            ${label && label !== 'count' ? 'label,' : ''}
            kmeans_cid,
            ST_ClusterDBSCAN(geom, ${dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
          FROM ${cluster_sql}) dbscan`;
        }

        if (theme === 'categorized') var cat_sql = `array_agg(cat) cat,`

        if (theme === 'graduated') var cat_sql = `${req.query.aggregate || 'sum'}(cat) cat,`

        var q = `
        SELECT
          count(1) count,
          SUM(size) size,
          ${cat_sql || ''}
          ${label && label !== 'count' ? '(array_agg(label))[1] AS label,' : ''}
          ST_X(ST_PointOnSurface(ST_Union(geom))) AS x,
          ST_Y(ST_PointOnSurface(ST_Union(geom))) AS y
  
        FROM ${cluster_sql}
        GROUP BY kmeans_cid ${dbscan ? ', dbscan_cid;': ';'}`;


        if (theme === 'competition') var q = `
        SELECT
          SUM(size) count,
          SUM(size) size,
          JSON_Agg(JSON_Build_Object(cat, size)) cat,
          ${label && label !== 'count' ? '(array_agg(label))[1] AS label,' : ''}
          ST_X(ST_PointOnSurface(ST_Union(geom))) AS x,
          ST_Y(ST_PointOnSurface(ST_Union(geom))) AS y
  
        FROM (
          SELECT
            SUM(size) size,
            cat,
            ${label && label !== 'count' ? '(array_agg(label))[1] AS label,' : ''}
            ST_Union(geom) geom,
            kmeans_cid,
            dbscan_cid
  
          FROM ${cluster_sql}
          GROUP BY cat, kmeans_cid ${dbscan ? ', dbscan_cid': ''}
  
        ) cluster GROUP BY kmeans_cid ${dbscan ? ', dbscan_cid;': ';'}`;

      // Apply grid aggregation if KMeans is not defined.
      } else {

        let r = parseInt(40075016.68 / Math.pow(2, req.query.z) * (layer.cluster_resolution || layer.cluster_hexresolution || 0.1));

        if (layer.cluster_hexresolution) {

          var _width = 2*r;
          var _height = 2*r/Math.sqrt(3);
          var with_sql = `
          WITH
          first as (
            SELECT
              id,

              ${cat} AS cat,

              ${size} AS size,

              ${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'} AS geom,

              ST_Point(
                round(ST_X(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${_width}) * ${_width},
                round(ST_Y(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${_height}) * ${_height}) p0

            FROM ${table} ${where_sql}
          ),
          second as (
            SELECT
              id,
              cat,
              size,
              CASE
                WHEN (geom <#> ST_Translate(p0,${_width/2},${_height/2})) < (geom <#> p0)
                  THEN ST_SnapToGrid(ST_Translate(p0,${_width/2},${_height/2}),1)
                WHEN (geom <#> ST_Translate(p0,-${_width/2},${_height/2})) < (geom <#> p0)
                  THEN ST_SnapToGrid(ST_Translate(p0,-${_width/2},${_height/2}),1)
                WHEN (geom <#> ST_Translate(p0,${_width/2},-${_height/2})) < (geom <#> p0)
                  THEN ST_SnapToGrid(ST_Translate(p0,${_width/2},-${_height/2}),1)
                WHEN (geom <#> ST_Translate(p0,-${_width/2},-${_height/2})) < (geom <#> p0)
                  THEN ST_SnapToGrid(ST_Translate(p0,-${_width/2},-${_height/2}),1)
                ELSE ST_SnapToGrid(p0,1)
              END as point
            FROM first
          )`;

          var agg_sql = `second GROUP BY point;`;

          var xy_sql = `
          ST_X(${layer.srid == 3857 && 'point' || 'ST_Transform(ST_SetSRID(point, 3857), ' + parseInt(layer.srid) + ')'}) x,
          ST_Y(${layer.srid == 3857 && 'point' || 'ST_Transform(ST_SetSRID(point, 3857), ' + parseInt(layer.srid) + ')'}) y`

        } else {

          var agg_sql = `
          (SELECT
            ${cat} AS cat,
            ${size} AS size,
            ST_X(${geom}) AS x,
            ST_Y(${geom}) AS y,
            round(ST_X(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${r}) * ${r} x_round,
            round(ST_Y(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${r}) * ${r} y_round
            
          FROM ${table} ${where_sql}) agg_sql GROUP BY x_round, y_round;`;

          var xy_sql = `
          percentile_disc(0.5) WITHIN GROUP (ORDER BY x) x,
          percentile_disc(0.5) WITHIN GROUP (ORDER BY y) y`
        }

        if (theme === 'categorized') var cat_sql = `array_agg(cat) cat,`

        if (theme === 'graduated') var cat_sql = `${req.query.aggregate || 'sum'}(cat) cat,`

        var q = `
        ${with_sql || ''}
        SELECT
          count(1) count,
          SUM(size) size,
          ${cat_sql || ''}
          ${xy_sql}
        FROM ${agg_sql}`;

      }

      var rows = await env.dbs[layer.dbs](q);
        
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  

      if (!theme) return res.code(200).send(rows.map(row => ({
        geometry: {
          x: row.x,
          y: row.y,
        },
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          label: label === 'count' ? parseInt(row.count) > 1 ? row.count : '' : row.label,
        }
      })));

      if (theme === 'categorized') return res.code(200).send(rows.map(row => ({
        geometry: {
          x: row.x,
          y: row.y,
        },
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          cat: row.cat.length === 1? row.cat[0] : null,
          label: row.label,
        }
      })));

      if (theme === 'graduated') return res.code(200).send(rows.map(row => ({
        geometry: {
          x: row.x,
          y: row.y,
        },
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          cat: parseFloat(row.cat),
          label: row.label,
        }
      })));

      if (theme === 'competition') return res.code(200).send(rows.map(row => ({
        geometry: {
          x: row.x,
          y: row.y,
        },
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          cat: Object.assign({}, ...row.cat),
          label: row.label,
        }
      })));

    }
  });
};