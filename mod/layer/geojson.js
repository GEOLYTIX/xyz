const dbs = require('../dbs')()

const sql_filter = require('../sql_filter')

const Roles = require('../roles.js')

module.exports = async (req, res) => {

  const layer = req.params.layer

  const roles = Roles.filter(layer, req.params.user && req.params.user.roles)

  if (!roles && layer.roles) return res.status(403).send('Access prohibited.')

  const SQLparams = []

  const filter =
    ` ${req.params.filter && `AND ${sql_filter(JSON.parse(req.params.filter), SQLparams)}` || ''}
    ${roles && Object.values(roles).some(r => !!r)
    && `AND ${sql_filter(Object.values(roles).filter(r => !!r), SQLparams)}`
    || ''}`


  var q = `
    SELECT
      ${layer.qID || null} AS id,
      ${req.params.cat || null} AS cat,
      ST_asGeoJson(${layer.geom}) AS geomj
    FROM ${req.params.table}
    WHERE true ${filter};`

  var rows = await dbs[layer.dbs](q, SQLparams)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  res.send(rows.map(row => ({
    type: 'Feature',
    geometry: JSON.parse(row.geomj),
    properties: {
      id: row.id,
      cat: row.cat
    }
  })))

}