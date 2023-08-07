const dbs = require('../utils/dbs')()

const sqlFilter = require('../utils/sqlFilter.js')

const Roles = require('../utils/roles.js')

module.exports = async (req, res) => {

  // Check the layer.roles{} against the user.roles[]
  const layer = Roles.check(req.params.layer, req.params.user?.roles)

  // The layer object did not pass the Roles.check()
  if (!layer) {
    return res.status(403).send('Access prohibited.')
  }

  // Get role filter.
  const roles = Roles.filter(layer, req.params.user?.roles)

  const SQLparams = [req.params.id]

  const roleFilter = roles && Object.values(roles).some(r => !!r)
    ? `AND ${sqlFilter(Object.values(roles).filter(r => !!r), SQLparams)}`
    : ''

  const fields = layer.infoj
    .filter(entry => !req.params.fields || (req.params.fields && req.params.fields.split(',').includes(entry.field)))
    .filter(entry => !entry.query)
    .filter(entry => entry.type !== 'key')
    .filter(entry => entry.field)
    .map(entry => `(${entry.fieldfx || entry.field}) AS ${entry.field}`)

  const q = `
  SELECT
    ${fields.join()}
  FROM ${req.params.table}
  WHERE ${layer.qID} = $1
  ${roleFilter}`

  // Validate dynamic method call.
  if (!Object.hasOwn(dbs, layer.dbs || req.params.workspace.dbs) || typeof dbs[layer.dbs || req.params.workspace.dbs] !== 'function') return;  

  const rows = await dbs[layer.dbs || req.params.workspace.dbs](q, SQLparams)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // return 204 if no record was returned from database.
  if (rows.length === 0) return res.status(202).send('No rows returned from table.')

  return res.send(rows[0])
}