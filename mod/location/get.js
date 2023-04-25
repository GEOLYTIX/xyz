const dbs = require('../utils/dbs')()

module.exports = async (req, res) => {

  const layer = req.params.layer

  const fields = layer.infoj
    .filter(entry => !req.params.fields || (req.params.fields && req.params.fields.split(',').includes(entry.field)))
    .filter(entry => !entry.query)
    .filter(entry => entry.type !== 'key')
    .filter(entry => entry.field)
    .map(entry => `(${entry.fieldfx || entry.field}) AS ${entry.field}`)

  var q = `
  SELECT
    ${fields.join()}
  FROM ${req.params.table}
  WHERE ${layer.qID} = $1`

  // Validate dynamic method call.
  if (!Object.hasOwn(dbs, layer.dbs || req.params.workspace.dbs) || typeof dbs[layer.dbs || req.params.workspace.dbs] !== 'function') return;  

  var rows = await dbs[layer.dbs || req.params.workspace.dbs](q, [req.params.id])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // return 204 if no record was returned from database.
  if (rows.length === 0) return res.status(202).send('No rows returned from table.')

  return res.send(rows[0])
}