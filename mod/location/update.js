const dbs = require('../dbs')()

module.exports = async (req, res) => {

  const layer = req.params.layer

  const fields = Object.entries(req.body)
    .map(entry => {
      if (entry[1] === null) return ` ${entry[0]} = null`
      if (typeof entry[1] === 'string') return ` ${entry[0]} = '${entry[1]}'`
      if (entry[1].coordinates) return ` ${entry[0]} = ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(entry[1])}'),${layer.srid})`
      if (typeof entry[1] === 'object') return ` ${entry[0]} = '${JSON.stringify(entry[1])}'`
      if (typeof entry[1] === 'boolean' || typeof entry[1] === 'number') return ` ${entry[0]} = ${entry[1]}`
    })

  // Remove tiles from mvt_cache.
  if (layer.mvt_cache) await dbs[layer.dbs](`
    DELETE FROM ${layer.mvt_cache}
    WHERE ST_Intersects(tile, (
      SELECT ${layer.geom}
      FROM ${req.params.table}
      WHERE ${layer.qID} = $1));`, [req.params.id])
 
  var q = `UPDATE ${req.params.table} SET ${fields.join()} WHERE ${layer.qID} = $1;`

  var rows = await dbs[layer.dbs](q, [req.params.id])

  if (rows instanceof Error) return res.status(500).send('PostgreSQL query error - please check backend logs.')

  // Remove tiles from mvt_cache.
  if (layer.mvt_cache) await dbs[layer.dbs](`
    DELETE FROM ${layer.mvt_cache}
    WHERE ST_Intersects(tile, (
      SELECT ${layer.geom}
      FROM ${req.params.table}
      WHERE ${layer.qID} = $1));`, [req.params.id])

  res.send('This is fine.')

}