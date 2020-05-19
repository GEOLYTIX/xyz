const dbs = require('../dbs')()

const sql_filter = require('./sql_filter')

module.exports = async (req, res) => {

  const layer = req.params.layer

  const roles = layer.roles
    && req.params.token
    && Object.keys(layer.roles)
      .filter(key => req.params.token.roles.includes(key))
      .reduce((obj, key) => {
        obj[key] = layer.roles[key];
        return obj;
      }, {});

  if (!roles && layer.roles) return res.status(403).send('Access prohibited.');

  const filter = await sql_filter(Object.assign(
    {},
    req.params.filter && JSON.parse(req.params.filter) || {},
    ...Object.values(roles)))

  var q = `
  SELECT
    ${layer.qID || null} AS id,
    ${req.params.cat || null} AS cat,
    ST_asGeoJson(${layer.geom}) AS geomj
  FROM ${req.params.table}
  WHERE true ${filter};`

  var rows = await dbs[layer.dbs](q)

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