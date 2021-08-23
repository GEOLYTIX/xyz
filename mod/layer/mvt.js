const dbs = require('../dbs')()

const sql_filter = require('../sql_filter')

const Roles = require('../roles.js')

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

  const roles = Roles.filter(layer, req.params.user && req.params.user.roles)

  if (!roles && layer.roles) return res.status(403).send('Access prohibited.');

  const SQLparams = []

  const filter =
    `${req.params.filter && ` AND ${sql_filter(JSON.parse(req.params.filter), SQLparams)}` || ''}`
    +`${roles && Object.values(roles).some(r => !!r)
    && ` AND ${sql_filter(Object.values(roles).filter(r => !!r), SQLparams)}` || ''}`

    // Construct array of fields queried
  const mvt_fields = Object.values(layer.style.themes || {})
    .map(theme => getField(theme))
    .filter(field => typeof field !== 'undefined')
  // Assign mvt_fields from single theme
  layer.style.theme && mvt_fields.push(getField(layer.style.theme))

  layer.style.label && mvt_fields.push(`${layer.style.label.field} AS label`)

  const geoms = layer.geoms && Object.keys(layer.geoms)

  var geom = geoms && layer.geoms[z] || layer.geom

  var geom = geoms && z < parseInt(geoms[0]) && Object.values(layer.geoms)[0] || geom
  
  var geom = geoms && z > parseInt(geoms[geoms.length -1]) && Object.values(layer.geoms)[geoms.length -1]  || geom

  const tile = `
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
            ${geom},
          ${layer.srid !== '3857' && `${layer.srid}), ST_Transform(` ||''}
            ST_MakeEnvelope(
              ${-m + (x * r)},
              ${ m - (y * r) - r},
              ${-m + (x * r) + r},
              ${ m - (y * r)},
              3857
            ),
          ${layer.srid !== '3857' && `${layer.srid}),` ||''}
          4096,
          1024,
          false
        ) geom
      FROM ${table}
      WHERE
        ST_Intersects(
          ${layer.srid !== '3857' && `ST_Transform(` ||''}
            ST_MakeEnvelope(
              ${-m + (x * r) - (r/4)},
              ${ m - (y * r) - r - (r/4)},
              ${-m + (x * r) + r + (r/4)},
              ${ m - (y * r) + (r/4)},
              3857
            ),
          ${layer.srid !== '3857' && `${layer.srid}),` ||''}
          ${geom}
        ) ${filter}
      ) tile`
  if (!filter && layer.mvt_cache) {

    var rows = await dbs[layer.dbs](`SELECT mvt FROM ${layer.mvt_cache} WHERE z = ${z} AND x = ${x} AND y = ${y}`)

    if (rows instanceof Error) console.log('failed to query mvt cache')

    if(!rows.length) {
      rows = await dbs[layer.dbs](`
        WITH n AS (
          INSERT INTO ${layer.mvt_cache}
          ${tile} ON CONFLICT (z, x, y) DO NOTHING RETURNING mvt
        ) SELECT mvt FROM n;
      `)

      if (rows instanceof Error) console.log('failed to cache mvt')
    }
    
    if (rows.length === 1)  return res.send(rows[0].mvt) // If found return the cached MVT to client.

  }

  function getField(theme) {

    return theme.fieldfx && `${theme.fieldfx} AS ${theme.field}` 
      || theme.fields
      || theme.field
  }

  var rows = dbs[layer.dbs] && await dbs[layer.dbs](tile, SQLparams)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // Return MVT to client.
  // res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.send(rows[0].mvt)

}