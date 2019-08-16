const env = require('../../../../mod/env');

const sql_filter = require('../../../../mod/pg/sql_filter');

module.exports =  fastify => {
  
  fastify.route({
    method: 'GET',
    url: '/api/location/select/cluster',
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
          coords: { type: 'string' },
          count: { type: 'integer' },
        },
        required: ['locale', 'layer', 'table', 'coords']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      fastify.evalParam.coords,
      fastify.evalParam.geomTable,
    ],
    handler: async (req, res) => {
  
      let
        layer = req.params.layer,
        table = req.query.table,
        geom = layer.geom,
        qID = layer.qID,
        coords = req.params.coords,
        filter = req.params.filter,
        label = layer.cluster_label ? layer.cluster_label : qID,
        count = parseInt(req.query.count) || 99;
  
        
      // SQL filter
      const filter_sql = filter && await sql_filter(filter) || '';
  
      // Query the feature count from lat/lng bounding box.
      var q = `
      SELECT
        ${qID} AS ID,
        ${label} AS label,
        array[st_x(st_centroid(${geom})), st_y(st_centroid(${geom}))] AS coords
      FROM ${table}
      WHERE true 
        ${filter_sql} 
      ORDER BY ST_Point(${coords}) <#> ${geom} LIMIT ${count};`;
  
      var rows = await env.dbs[layer.dbs](q);
  
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  
      res.code(200).send(Object.keys(rows).map(record => ({
        id: rows[record].id,
        label: rows[record].label,
        coords: rows[record].coords
      })));
    
    }
  });
};