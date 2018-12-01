module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/layer/grid',
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

      // Return 406 if table is not defined as request parameter.
      if (!table) return res.code(406).send('Missing table.');

      let
        geom = layer.geom,
        size = req.query.size,
        color = req.query.color,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);

      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table, geom, size, color]
        .some(val => (typeof val === 'string' && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }

      var q = `
      SELECT
          lon,
          lat,
          ${size} size,
          ${color} color
      FROM ${table}
      WHERE
          ST_DWithin(
              ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
              ${geom}, 0.000001)
          AND ${size} >= 1 LIMIT 10000;`;


      var rows = await global.pg.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      if (rows.length === 0) return res.code(204).send();

      res.code(200).send(rows.map(row => {
        return Object.keys(row).map(field => row[field]);
      }));

    }
  });
};