module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/location/select/cluster',
    beforeHandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace[token.access].config.locales[req.query.locale];

      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.query.layer];

      // Return 406 if layer is not found in locale.
      if (!layer) return res.code(406).send('Invalid layer.');

      const table = req.query.table;

      // Return 406 if table is not defined as query parameter.
      if (!table) return res.code(406).send('Missing table.');

      const lnglat = req.query.lnglat.split(',').map(ll => parseFloat(ll));

      // Return 406 if lnglat is not defined as query parameter.
      if (!lnglat) return res.code(406).send('Missing lnglat.');
  
      let
        geom = layer.geom,
        qID = layer.qID,
        filter = req.query.filter && JSON.parse(req.query.filter),
        label = layer.cluster_label ? layer.cluster_label : qID,
        count = parseInt(req.query.count) || 99;
  
      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table, geom, qID, label]
        .some(val => (typeof val === 'string' && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
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