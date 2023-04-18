const dbs = require('../utils/dbs')()

const sqlFilter = require('../utils/sqlFilter')

const validateRequestParams = require('../utils/validateRequestParams')

const Roles = require('../utils/roles.js')

module.exports = async (req, res) => {

  const layer = req.params.layer

  const geom = req.params.geom || layer.geom

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

  // Get fields array from query params.
  const fields = req.params.fields?.split(',')
    .map(field => req.params.workspace.templates[field]?.template || field)
    .filter(field => !!field)

  var q = `
    SELECT
      ${layer.qID || null},
      ST_AsText(${geom})
      ${fields.length && `, ${fields.join(', ')}` || ''}

    FROM ${req.params.table || layer.table}
    WHERE ${geom} IS NOT NULL ${filter};`

  var rows = await dbs[layer.dbs || req.params.workspace.dbs](q, SQLparams)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')
  
  const reduce = rows.map(row=>Object.values(row))

  return res.send(reduce)
}