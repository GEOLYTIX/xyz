module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/list', 
    prehandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace[token.access].config.locales[req.query.locale];

      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.query.layer];

      // Return 406 if layer is not found in locale.
      if (!layer) return res.code(406).send('Invalid layer.');

      // Return 406 if location id is missing.
      if (!req.query.id) return res.code(406).send('Missing location id.');

      // Get table definition from layer infoj.
      const tableDef = layer.infoj.find(
        entry => entry.title === decodeURIComponent(req.query.tableDef)
      );

      if (!tableDef) return res.code(406).send('Missing table definition.');

      let orderBy = [], conditions = [];

      let fields = tableDef.columns.map(col => {
        // 
        if(col.fx) col.fieldfx = `${col.fx}(a.${layer.geom}${col.geography ? '::geography' : ''}, b.${tableDef.geom}${col.geography ? '::geography' : ''})`;
        if(col.orderby) orderBy.push(`(${col.fx ? '' : 'b.'}${col.fieldfx || col.field})::${col.type || 'text'}`);
        if(col.condition && col.condition.phrase) conditions.push(`(${col.fx ? '' : 'b.'}${col.fieldfx || col.field})::${col.type || 'text'} ${col.condition.operator || 'like'} '${col.condition.phrase}'`);
        return `(${col.fx ? '' : 'b.'}${col.fieldfx || col.field})::${col.type || 'text'} AS ${col.field}`;
      });

      let q = `SELECT ${fields.join(',')} 
                FROM ${layer.table} a, ${tableDef.table} b 
                WHERE ${layer.qID} = $1 
                ${conditions.length ? `AND ${conditions.join(',')}` : ''}
                ORDER BY ${orderBy.join(',')} ${tableDef.order || 'ASC'} LIMIT ${tableDef.limit || 100};`;

      const rows = await global.pg.dbs[layer.dbs](q, [req.query.id]);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);

    }
  });
};