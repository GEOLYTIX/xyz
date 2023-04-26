const dbs = require('../utils/dbs')()

module.exports = async (req, res) => {

  const layer = req.params.layer

  // vals for variable substitution in query
  const vals = []

  // select array for insert statement
  const selects = []

  // keys array for insert statement
  const keys = Object.keys(req.body).map((key, i)=> {

    if (key === layer.geom) {

      // push geometry scaffolding into selects array.
      selects.push(`ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON(\$${i+1})), ${layer.srid})`)

      // push json string for GeomFromGeoJSON method into vals array.
      vals.push(JSON.stringify(req.body[key]))

      return key
    }

    // push numbered substitute variable into selects array.
    selects.push(`\$${i+1}`)

    // push value for substitution into vals array.
    vals.push(req.body[key])
    
    return key
  })

  var q = `
  INSERT INTO ${req.params.table} (${keys.join(',')})
  SELECT ${selects.join(',')}
  RETURNING ${layer.qID} AS id;`

  // Validate dynamic method call.
  if (!Object.hasOwn(dbs, layer.dbs || req.params.workspace.dbs) || typeof dbs[layer.dbs || req.params.workspace.dbs] !== 'function') return;

  var rows = await dbs[layer.dbs || req.params.workspace.dbs](q, vals)

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