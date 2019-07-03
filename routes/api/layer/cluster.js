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
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north),
        z = parseInt(req.query.z),
        m = 20037508.34,
        r = parseInt((m * 2) / (Math.pow(2, z)) * parseFloat(req.query.resolution));
          

      // SQL filter
      const filter_sql = filter && await sql_filter(filter) || ''; 

      const agg_sql = `
      SELECT
        ${cat} AS cat,
        ${size} AS size,
        ST_X(${geom}) AS x_3857,
        ST_Y(${geom}) AS y_3857,
        round(ST_X(${geom}) / ${r}) * ${r} x_round,
        round(ST_Y(${geom}) / ${r}) * ${r} y_round
        
      FROM ${table}
      WHERE
        ST_DWithin(
          ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 3857),
          ${geom},
          0.00001
        )
        ${filter_sql}`;

 

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


      if (theme === 'competition') var q = `
      SELECT
        SUM(size) count,
        SUM(size) size,
        JSON_Agg(JSON_Build_Object(cat, size)) cat,
        percentile_disc(0.5) WITHIN GROUP (ORDER BY x_3857) x,
        percentile_disc(0.5) WITHIN GROUP (ORDER BY y_3857) y

      FROM (
        SELECT
          SUM(size) size,
          cat,
          kmeans_cid,
          dbscan_cid,
          


        FROM (${dbscan_sql}) dbscan GROUP BY kmeans_cid, dbscan_cid, cat

      ) cluster GROUP BY kmeans_cid, dbscan_cid;`;
  
      
      var rows = await env.dbs[layer.dbs](q);
        
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  

      if (!theme) return res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: {
          x: row.x,
          y: row.y,
        },
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size)
        }
      })));

      if (theme === 'categorized') return res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: {
          x: row.x,
          y: row.y,
        },
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          cat: row.cat.length === 1? row.cat[0] : null
        }
      })));

      if (theme === 'graduated') return res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: {
          x: row.x,
          y: row.y,
        },
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          cat: parseFloat(row.cat)
        }
      })));

      if (theme === 'competition') return res.code(200).send(rows.map(row => ({
        type: 'Feature',
        geometry: {
          x: row.x,
          y: row.y,
        },
        properties: {
          count: parseInt(row.count),
          size: parseInt(row.size),
          cat: Object.assign({}, ...row.cat)
        }
      })));

    }
  });
};