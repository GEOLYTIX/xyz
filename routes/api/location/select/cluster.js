module.exports =  fastify => {
  
  fastify.route({
    method: 'GET',
    url: '/api/location/select/cluster',
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
          filter: { type: 'string' },
          lnglat: { type: 'string' },
          count: { type: 'integer' },
        },
        required: ['locale', 'layer', 'table', 'lnglat']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      fastify.evalParam.lnglat,
    ],
    handler: async (req, res) => {
  
      let
        layer = req.params.layer,
        table = req.query.table,
        geom = layer.geom,
        qID = layer.qID,
        lnglat = req.params.lnglat,
        filter = req.params.filter,
        label = layer.cluster_label ? layer.cluster_label : qID,
        count = parseInt(req.query.count) || 99;
  
      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table, geom, qID, label]
        .some(val => (typeof val === 'string'
          && global.workspace.lookupValues.indexOf(val) < 0))) {
        return res.code(406).send(new Error('Invalid parameter.'));
      }
  
      // SQL filter
      const filter_sql = filter && await require(global.appRoot + '/mod/pg/sql_filter')(filter) || '';
  
      // Query the feature count from lat/lng bounding box.
      var q = `
      SELECT
        ${qID} AS ID,
        ${label} AS label,
        array[st_x(st_centroid(${geom})), st_y(st_centroid(${geom}))] AS lnglat
      FROM ${table}
      WHERE true 
        ${filter_sql} 
      ORDER BY ST_Point(${lnglat}) <#> ${geom} LIMIT ${count};`;
  
      var rows = await global.pg.dbs[layer.dbs](q);
  
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
  
      res.code(200).send(Object.keys(rows).map(record => ({
        id: rows[record].id,
        label: rows[record].label,
        lnglat: rows[record].lnglat
      })));
    
    }
  });
};