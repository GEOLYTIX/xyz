const dbs = require('../utils/dbs')()

const validateRequestParams = require('../utils/validateRequestParams')

module.exports = async (req, res) => {

  const layer = req.params.layer

  // Validate URL parameter
  if (!validateRequestParams(req.params)) {

    return res.status(400).send('URL parameter validation failed.')
  }

  let
    table = req.params.table,
    geom = layer.geom,
    size = req.params.size,
    color = req.params.color,
    viewport = req.params.viewport.split(',')

  var q = `
  SELECT
    ST_X(ST_Transform(${layer.geom}, ${layer.srid})) x,
    ST_Y(ST_Transform(${layer.geom}, ${layer.srid})) y,
    ${size} size,
    ${color} color
  FROM ${table}
  WHERE
    ST_Intersects(
      ST_MakeEnvelope(
        ${viewport[0]},
        ${viewport[1]},
        ${viewport[2]},
        ${viewport[3]},
        ${layer.srid}
      ),
      ${geom}
    )
    AND ${size} >= 1 LIMIT 10000;`

  // Validate dynamic method call.
  if (!Object.hasOwn(dbs, layer.dbs || req.params.workspace.dbs) || typeof dbs[layer.dbs || req.params.workspace.dbs] !== 'function') return;

  var rows = await dbs[layer.dbs || req.params.workspace.dbs](q)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  if (rows.length === 0) return res.status(204).send()

  res.send(rows.map(row => Object.keys(row).map(field => row[field])))

}