module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/layer/extent',
    preHandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace[token.access].config.locales[req.query.locale];

      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.query.layer];

      // Return 406 if layer is not found in locale.
      if (!layer) return res.code(406).send('Invalid layer.');

      let
        geom = layer.geom,
        geom_3857 = layer.geom_3857;

      // Get table entry from layer or min table in from tables array.
      const table = layer.table
        || Object.values(layer.tables)[0]
        || Object.values(layer.tables)[1];


      let _geom;

      if (geom) _geom = `ST_Extent(${geom})`;
      
      if (geom_3857) _geom = `Box2D(ST_Transform(ST_SetSRID(ST_Extent(${geom_3857}), 3857), 4326))`;

      // Query the estimated extent for the layer geometry field from layer table.
      rows = await global.pg.dbs[layer.dbs](`SELECT ${_geom} FROM ${table};`);

      
      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // Get bounds from first row value.
      const bounds = Object.values(Object.values(rows)[0])[0];

      // Return 204 if bounds couldn't be formed.
      if (!bounds) return res.code(204).send('No bounds.');

      // Regex format bounds as comma separated string and return to client.
      res.code(200).send(/\((.*?)\)/.exec(bounds)[1].replace(/ /g, ','));

    }
  });
};