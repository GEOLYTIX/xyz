module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/layer/mvt/:z/:x/:y',
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
        geom_3857 = layer.geom_3857,
        filter = req.query.filter && JSON.parse(req.query.filter),
        id = layer.qID || null,
        x = parseInt(req.params.x),
        y = parseInt(req.params.y),
        z = parseInt(req.params.z),
        m = 20037508.34,
        r = (m * 2) / (Math.pow(2, z));

      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string' && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }

      // SQL filter
      const filter_sql = filter && await require(global.appRoot + '/mod/pg/sql_filter')(filter) || '';

      // Use MVT cache if set on layer and no filter active.
      const mvt_cache = (!filter_sql && layer.mvt_cache);

      if (mvt_cache) {

        // Get MVT from cache table.
        var rows = await global.pg.dbs[layer.dbs](`SELECT mvt FROM ${table}__mvts WHERE z = ${z} AND x = ${x} AND y = ${y}`);

        if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

        // If found return the cached MVT to client.
        if (rows.length === 1) return res
          .type('application/x-protobuf')
          .code(200)
          .send(rows[0].mvt);

      }

      // Create a new tile and store in cache table if defined.
      // ST_MakeEnvelope() in ST_AsMVT is based on https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql
      var q = `
      ${mvt_cache ? `INSERT INTO ${table}__mvts (z, x, y, mvt, tile)` : ''}
      SELECT
        ${z},
        ${x},
        ${y},
        ST_AsMVT(tile, '${req.query.layer}', 4096, 'geom') mvt,
        ST_MakeEnvelope(
          ${-m + (x * r)},
          ${ m - (y * r)},
          ${-m + (x * r) + r},
          ${ m - (y * r) - r},
          3857
        ) tile

      FROM (

        SELECT
          ${id} id,
          ${layer.mvt_fields ? layer.mvt_fields.toString() + ',' : ''}
          ST_AsMVTGeom(
            ${geom_3857},
            ST_MakeEnvelope(
              ${-m + (x * r)},
              ${ m - (y * r)},
              ${-m + (x * r) + r},
              ${ m - (y * r) - r},
              3857
            ),
          4096,
          256,
          true) geom

        FROM ${table}

        WHERE
          ST_DWithin(
            ST_MakeEnvelope(
              ${-m + (x * r)},
              ${ m - (y * r)},
              ${-m + (x * r) + r},
              ${ m - (y * r) - r},
              3857
            ),
            ${geom_3857},
            0
          )

          ${filter_sql}

      ) tile
      
      ${mvt_cache ? 'RETURNING mvt;' : ';'}`;

      rows = await global.pg.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // Return MVT to client.
      res
        .type('application/x-protobuf')
        .code(200)
        .send(rows[0].mvt);

    }
  });
};