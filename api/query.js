const auth = require('../mod/auth/handler')

const dbs = require('../mod/dbs')()

const sql_filter = require('../mod/layer/sql_filter')

const getWorkspace = require('../mod/workspace/getWorkspace')

module.exports = async (req, res) => {

  req.params = Object.assign(req.params || {}, req.query || {})

  const workspace = await getWorkspace(req.params.clear_cache)

  if (workspace instanceof Error) return res.status(500).send(workspace.message)

  if (req.params.clear_cache) return res.send('/query endpoint cache cleared')

  const template = workspace.templates[decodeURIComponent(req.params._template || req.params.template)]

  if(!template) return res.status(404).send('Template not found')

  if (template.err) return res.status(500).send(template.err.message)

  await auth(req, res, template.access)

  if (res.finished) return

  if (req.params.locale && req.params.layer) {

    const layer = req.params.locale && workspace.locales[req.params.locale].layers[req.params.layer]

    const roles = layer.roles && req.params.token && req.params.token.roles && req.params.token.roles.filter(
      role => layer.roles[role]).map(
        role => layer.roles[role]) || []

    const filter = await sql_filter(Object.assign(
      {},
      req.params.filter && JSON.parse(req.params.filter) || {},
      roles.length && Object.assign(...roles) || {}))

    req.params.viewport = req.params.viewport && req.params.viewport.split(',')
    
    const viewport = req.params.viewport && `
    AND ST_DWithin(
      ST_Transform(
        ST_MakeEnvelope(
          ${req.params.viewport[0]},
          ${req.params.viewport[1]},
          ${req.params.viewport[2]},
          ${req.params.viewport[3]},
          ${parseInt(req.params.viewport[4])}
        )
      ,${layer.srid}),
      ${layer.geom}, 0.00001)` || ''

    Object.assign(req.params, {layer: layer, filter: filter, viewport: viewport})
  }

  try {
    var q = template.render(req.params)
  } catch(err) {
    res.status(500).send(err.message)
    return console.error(err)
  }

  const rows = await dbs[template.dbs || req.params.dbs || req.params.layer.dbs](q)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // return 204 if no record was returned from database.
  if (!rows || !rows.length) return res.status(202).send('No rows returned from table.')

  const checkEmptyRow = row => typeof row === 'object' && Object.values(row).some(val => val !== null)

  if (rows.length && !rows.some(row => checkEmptyRow(row)) || !checkEmptyRow(rows)) {
    return res.status(202).send('No rows returned from table.')
  }

  // Send the infoj object with values back to the client.
  res.send(rows.length === 1 && rows[0] || rows)
}