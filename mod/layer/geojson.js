const dbs = require('../dbs')()

const sql_filter = require('../sql_filter')

const Roles = require('../roles.js')

module.exports = async (req, res) => {

  const layer = req.params.layer

  if (Object.values(req.params)
    .filter(val => !!val)
    .filter(val => typeof val !== 'object')
    .some(val => val && !/^[A-Za-z0-9/\s/g.,_-]*$/.test(val))) {

    return res.status(400).send('URL parameter validation failed.')
  }

  const roles = Roles.filter(layer, req.params.user && req.params.user.roles)

  if (!roles && layer.roles) return res.status(403).send('Access prohibited.')

  const SQLparams = []

  const filter =
  ` ${layer.filter?.default && 'AND '+layer.filter?.default || ''}
    ${req.params.filter && `AND ${sql_filter(JSON.parse(req.params.filter), SQLparams)}` || ''}
    ${roles && Object.values(roles).some(r => !!r)
    && `AND ${sql_filter(Object.values(roles).filter(r => !!r), SQLparams)}`
    || ''}`


  var q = `
    SELECT
      ${layer.qID || null} AS id,
      ST_asGeoJson(${layer.geom}) AS geomj
    FROM ${req.params.table || layer.table}
    WHERE true ${filter};`

  var rows = await dbs[layer.dbs](q, SQLparams)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  res.send(rows.map(row => ({
    type: 'Feature',
    geometry: JSON.parse(row.geomj),
    id: row.id,
  })))

}