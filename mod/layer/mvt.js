const dbs = require('../dbs')()

const sql_filter = require('./sql_filter')

module.exports = async (req, res) => {

  const layer = req.params.layer

  let
    table = req.params.table,
    id = layer.qID || null,
    x = parseInt(req.params.x),
    y = parseInt(req.params.y),
    z = parseInt(req.params.z),
    m = 20037508.34,
    r = (m * 2) / (Math.pow(2, z))

  const roles = layer.roles && req.params.token.roles && req.params.token.roles.filter(
    role => layer.roles[role]).map(
      role => layer.roles[role]) || []

  const filter = await sql_filter(Object.assign(
    {},
    req.params.filter && JSON.parse(req.params.filter) || {},
    roles.length && Object.assign(...roles) || {}))

  if (!filter && layer.mvt_cache) {

    // Get MVT from cache table.
    var rows = await dbs[layer.dbs](`SELECT mvt FROM ${layer.mvt_cache} WHERE z = ${z} AND x = ${x} AND y = ${y}`)

    if (rows instanceof Error) console.log('failed to query mvt cache')

    // If found return the cached MVT to client.
    if (rows.length === 1) return res.send(rows[0].mvt)

  }

  // Construct array of fields queried
  const mvt_fields = Object.values(layer.style.themes || {}).map(
    theme => theme.fieldfx && `${theme.fieldfx} AS ${theme.field}` || theme.field)

  // Create a new tile and store in cache table if defined.
  // ST_MakeEnvelope() in ST_AsMVT is based on https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql
  var q = `
    ${!filter && layer.mvt_cache && `INSERT INTO ${layer.mvt_cache} (z, x, y, mvt, tile)` ||''}
    SELECT
      ${z},
      ${x},
      ${y},
      ST_AsMVT(tile, '${req.params.layer}', 4096, 'geom') mvt,
      ST_MakeEnvelope(
        ${-m + (x * r)},
        ${ m - (y * r)},
        ${-m + (x * r) + r},
        ${ m - (y * r) - r},
        ${req.params.srid || 3857}
      ) tile

    FROM (

      SELECT
        ${id} as id,
        ${mvt_fields.length && mvt_fields.toString() + ',' || ''}
        ST_AsMVTGeom(
          ${layer.geom},
          ST_MakeEnvelope(
            ${-m + (x * r)},
            ${ m - (y * r)},
            ${-m + (x * r) + r},
            ${ m - (y * r) - r},
            ${req.params.srid || 3857}
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
            ${req.params.srid || 3857}
          ),
          ${layer.geom},
          ${r / 4}
        )

        ${filter}

    ) tile
    
    ${!filter && layer.mvt_cache && 'RETURNING mvt' ||''};`

  var rows = dbs[layer.dbs] && await dbs[layer.dbs](q)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // Return MVT to client.
  res.send(rows[0].mvt);

}