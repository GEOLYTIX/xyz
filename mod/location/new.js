const dbs = require('../utils/dbs')()

module.exports = async (req, res) => {

  const layer = req.params.layer

  const vals = []

  const keys = Object.keys(req.body).map((key, i)=> {

    if (key === layer.geom) {
      vals.push(`ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON('${JSON.stringify(req.body[key])}')), ${layer.srid})`)
      return key
    }

    vals.push(req.body[key])

    return key
  })
 
  var q = `
  INSERT INTO ${req.params.table} (${keys.join(',')})
  SELECT ${vals.join(',')}
  RETURNING ${layer.qID} AS id;`

  var rows = await dbs[layer.dbs || req.params.workspace.dbs](q)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // Cached tiles which intersect the geometry must be retired.
  if (layer.mvt_cache) await dbs[layer.dbs || req.params.workspace.dbs](`
    DELETE 
    FROM ${layer.mvt_cache}
    WHERE ST_Intersects(tile, (
      SELECT ${layer.geom}
      FROM ${req.params.table}
      WHERE ${layer.qID} = $1
    ));`, [rows[0].id])

  // Return id of newly created location.
  res.send(Array.isArray(rows) && rows[0].id?.toString() || null)

}