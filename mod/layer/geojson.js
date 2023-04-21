const dbs = require('../utils/dbs')()

const sqlFilter = require('../utils/sqlFilter')

const validateRequestParams = require('../utils/validateRequestParams')

const Roles = require('../utils/roles.js')

module.exports = async (req, res) => {

  const layer = req.params.layer

  // Validate URL parameter
  if (!validateRequestParams(req.params)) {

    return res.status(400).send('URL parameter validation failed.')
  }

  const roles = Roles.filter(layer, req.params.user && req.params.user.roles)

  if (!roles && layer.roles) return res.status(403).send('Access prohibited.')

  const SQLparams = []

  const filter =
  ` ${layer.filter?.default && 'AND '+layer.filter?.default || ''}
    ${req.params.filter && `AND ${sqlFilter(JSON.parse(req.params.filter), SQLparams)}` || ''}
    ${roles && Object.values(roles).some(r => !!r)
    && `AND ${sqlFilter(Object.values(roles).filter(r => !!r), SQLparams)}`
    || ''}`

  var q = `
    SELECT
      ${layer.qID || null} AS id,
      ST_asGeoJson(${req.params.geom || layer.geom}) AS geomj
      ${Array.isArray(layer.properties)
        && `, json_build_object(${layer.properties.map(field=>`'${field}',${req.params.workspace.templates[field]?.template || field}`).join(', ')}) as properties`
        || ''}

    FROM ${req.params.table || layer.table}
    WHERE ${req.params.geom || layer.geom} IS NOT NULL ${filter};`

  // Validate dynamic method call.
  if (typeof dbs[layer.dbs || req.params.workspace.dbs] !== 'function') return;    

  var rows = await dbs[layer.dbs || req.params.workspace.dbs](q, SQLparams)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  res.send(rows.map(row => ({
    type: 'Feature',
    geometry: JSON.parse(row.geomj),
    properties: row.properties,
    id: row.id,
  })))

}