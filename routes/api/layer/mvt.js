const env = require('../../../mod/env');

const sql_filter = require('../../../mod/pg/sql_filter');

//const evalParam = require('../../../mod/_evalParam');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/layer/mvt/:z/:x/:y',
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
          mapview_srid: { type: 'integer' },
          filter: { type: 'string' },
        },
        required: ['locale', 'layer', 'table']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      fastify.evalParam.geomTable,
    ],
    // preHandler: [
    //   evalParam.token,
    //   evalParam.locale,
    //   evalParam.layer,
    //   evalParam.roles,
    //   evalParam.geomTable,
    // ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        table = req.query.table,
        geom = layer.geom,
        srid = layer.srid,
        mapview_srid = req.query.mapview_srid,
        filter = req.params.filter,// && JSON.parse(req.query.filter),
        id = layer.qID || null, //'row_number() over()',
        x = parseInt(req.params.x),
        y = parseInt(req.params.y),
        z = parseInt(req.params.z),
        m = 20037508.34,
        r = (m * 2) / (Math.pow(2, z));

      // SQL filter
      const filter_sql = filter && await sql_filter(filter) || '';

      // Use MVT cache if set on layer and no filter active.
      const mvt_cache = (!filter_sql && (!layer.roles || !Object.keys(layer.roles).length) && layer.mvt_cache);

      if (mvt_cache) {

        // Get MVT from cache table.
        var rows = await env.dbs[layer.dbs](`SELECT mvt FROM ${layer.mvt_cache} WHERE z = ${z} AND x = ${x} AND y = ${y}`);

        if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

        // If found return the cached MVT to client.
        if (rows.length === 1) return res
          .type('application/x-protobuf')
          .code(200)
          .send(rows[0].mvt);

      }

      // Construct array of fields queried
      const mvt_fields = Object.values(layer.style.themes || {}).map(theme => theme.fieldfx && `${theme.fieldfx} AS ${theme.field}` || theme.field);

      // Create a new tile and store in cache table if defined.
      // ST_MakeEnvelope() in ST_AsMVT is based on https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql
      var q = `
      ${mvt_cache ? `INSERT INTO ${layer.mvt_cache} (z, x, y, mvt, tile)` : ''}
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
          ${mapview_srid}
        ) tile

      FROM (

        SELECT
          ${id} as id,
          ${mvt_fields.length && mvt_fields.toString() + ',' || ''}
          ST_AsMVTGeom(
            ${geom},
            ST_MakeEnvelope(
              ${-m + (x * r)},
              ${ m - (y * r)},
              ${-m + (x * r) + r},
              ${ m - (y * r) - r},
              ${mapview_srid}
            ),
            4096,
            256,
            true
          ) geom

        FROM ${table}

        WHERE
          ST_DWithin(
            ST_MakeEnvelope(
              ${-m + (x * r)},
              ${ m - (y * r)},
              ${-m + (x * r) + r},
              ${ m - (y * r) - r},
              ${mapview_srid}
            ),
            ${geom},
            ${r/4}
          )

          ${filter_sql}

      ) tile
      
      ${mvt_cache ? 'RETURNING mvt;' : ';'}`;

      rows = await env.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // Return MVT to client.
      res
        .type('application/x-protobuf')
        .code(200)
        .send(rows[0].mvt);

    }
  });
};