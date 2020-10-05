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

  const roles = layer.roles
    && req.params.token
    && Object.keys(layer.roles)
      .filter(key => req.params.token.roles.includes(key))
      .reduce((obj, key) => {
        obj[key] = layer.roles[key];
        return obj;
      }, {});

  if (!roles && layer.roles) return res.status(403).send('Access prohibited.');

  const filter = `
  ${req.params.filter
    && await sql_filter(Object.entries(JSON.parse(req.params.filter)).map(e => ({[e[0]]:e[1]})))
    || ''}
  ${roles && Object.values(roles).some(r => !!r)
    && await sql_filter(Object.values(roles).filter(r => !!r), 'OR')
    || ''}`.replace(/^\s*$/,'')

  if (!filter && layer.mvt_cache) {

    // Get MVT from cache table.
    var rows = await dbs[layer.dbs](`SELECT mvt FROM ${layer.mvt_cache} WHERE z = ${z} AND x = ${x} AND y = ${y}`)

    if (rows instanceof Error) console.log('failed to query mvt cache')

    // res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')

    // If found return the cached MVT to client.
    if (rows.length === 1) return res.send(rows[0].mvt)

  }

  // Construct array of fields queried
  const mvt_fields = Object.values(layer.style.themes || {}).map(
    theme => theme.fieldfx && `${theme.fieldfx} AS ${theme.field}` || theme.fields || theme.field)

  // Create a new tile and store in cache table if defined.
  // ST_MakeEnvelope() in ST_AsMVT is based on https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql
  var q = `
    ${!filter && layer.mvt_cache && `INSERT INTO ${layer.mvt_cache} (z, x, y, mvt, tile)` ||''}
    SELECT
      ${z},
      ${x},
      ${y},
      ST_AsMVT(tile, '${layer.key}', 4096, 'geom') mvt,
      ST_MakeEnvelope(
        ${-m + (x * r)},
        ${ m - (y * r) - r},
        ${-m + (x * r) + r},
        ${ m - (y * r)},
        3857
      ) tile

    FROM (

      SELECT
        ${id} as id,
        ${mvt_fields.length && mvt_fields.toString() + ',' || ''}
        ST_AsMVTGeom(
          ${layer.srid !== '3857' && `ST_Transform(` ||''}
            ${layer.geom},
          ${layer.srid !== '3857' && `${layer.srid}),` ||''}
          ${layer.srid !== '3857' && `ST_Transform(` ||''}
            ST_MakeEnvelope(
              ${-m + (x * r)},
              ${ m - (y * r) - r},
              ${-m + (x * r) + r},
              ${ m - (y * r)},
              3857
            ),
          ${layer.srid !== '3857' && `${layer.srid}),` ||''}
          4096,
          256,
          true
        ) geom

      FROM ${table}

      WHERE
        ST_Intersects(
          ${layer.srid !== '3857' && `ST_Transform(` ||''}
            ST_MakeEnvelope(
              ${-m + (x * r) - (r/16)},
              ${ m - (y * r) - r - (r/16)},
              ${-m + (x * r) + r + (r/16)},
              ${ m - (y * r) + (r/16)},
              3857
            ),
          ${layer.srid !== '3857' && `${layer.srid}),` ||''}
          ${layer.geom}
        )

        ${filter}

    ) tile
    
    ${!filter && layer.mvt_cache && 'RETURNING mvt' ||''};`

  var rows = dbs[layer.dbs] && await dbs[layer.dbs](q)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // Return MVT to client.
  // res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.send(rows[0].mvt)

}