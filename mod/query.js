const dbs = require('./dbs')()

const sql_filter = require('./layer/sql_filter')

const Roles = require('./roles.js')

module.exports = async (req, res) => {

  const template = req.params.template

  // A query template is required.
  if (!template) return res.status(400).send('Missing query template.')

  // Assign role filter and viewport params from layer object.
  if (req.params.layer) {

    // Get locale for layer.
    const locale = req.params.locale && req.params.workspace.locales[req.params.locale]

    // Get layer from workspace locale or layer template.
    const layer = locale && locale.layers[req.params.layer] ||  req.params.workspace.templates[req.params.layer]

    // A layer must be found if the layer param is set.
    if (!layer) return res.status(400).send('Layer not found.')

    // Set layer dbs as fallback param if not defined.
    req.params.dbs = req.params.dbs || layer.dbs

    // Get array of role filter from layer configuration.
    const roleFilter = Roles.filter(layer, req.params.user && req.params.user.roles)

    // Access is prohibited if the layer has roles assigned but the roleFilter is falsy.
    if (!roleFilter && layer.roles) return res.status(403).send('Access prohibited.');

    // Create params filter string from roleFilter filter params.
    req.params.filter = `
      ${req.params.filter
        && await sql_filter(Object.entries(JSON.parse(req.params.filter)).map(e => ({[e[0]]:e[1]})))
        || ''}
      ${roleFilter && Object.values(roleFilter).some(r => !!r)
        && await sql_filter(Object.values(roleFilter).filter(r => !!r), 'OR')
        || ''}`

    // Assign viewport params filter string.
    const viewport = req.params.viewport && req.params.viewport.split(',')

    req.params.geom = req.params.geom || layer.geom
    
    req.params.viewport = viewport && `
      AND
        ST_Intersects(
          ST_Transform(
            ST_MakeEnvelope(
              ${viewport[0]},
              ${viewport[1]},
              ${viewport[2]},
              ${viewport[3]},
              ${parseInt(viewport[4])}
            ),
            ${layer.srid}),
          ${req.params.geom}
        )` || ''

    req.params.qID = req.params.qID || layer.qID

  } else {

    // Reserved will be deleted to prevent DDL injection.
    delete req.params.filter
    delete req.params.viewport
  }

  // Assign body to params to enable reserved %{body} parameter.
  req.params.body = req.body

  // Array of params for parameterized queries with node-pg.
  const params = []

  // Reserved param keys may not be substituted from request query params.
  const reserved = new Set(['viewport', 'filter'])

  // Method to be applied if template does not have a render method.
  const render = template => template

    // Replace parameter for identifiers, e.g. table, schema, columns
    .replace(/\$\{(.*?)\}/g, matched => {

      // Remove template brackets from matched param.
      const param = matched.replace(/\$|\{|\}/g, "")

      // Get param value from request params object.
      const change = req.params[param] || ""

      // Change value may only contain a limited set of whitelisted characters.
      if (!reserved.has(param) && !/^[A-Za-z0-9._-]*$/.test(change)) {

        // Err and return empty string if the change value is invalid.
        console.error("Change param no bueno")
        return ""
      }
  
      return change
    })

    // Replace params with placeholder, eg. $1, $2
    .replace(/\%\{(.*?)\}/g, matched => {

      // Remove template brackets from matched param.
      const param = matched.replace(/\%|\{|\}/g, "")

      // Push value from request params object into params array.
      params.push(req.params[param] || "")
  
      return `\$${params.length}`
    })

  // Render the query string q from tbe template and request params.
  try {
    template.template = template.render && template.render(req.params) 
    var q = render(template.template, req.params)
  } catch(err) {
    res.status(500).send(err.message)
    return console.error(err)
  }

  // Get query pool from dbs module.
  const query = dbs[template.dbs || req.params.dbs]

  if (!query) return res.status(400).send(`${template.dbs || req.params.dbs} connection not found.`)

  // Nonblocking queries will not wait for results but return immediately.
  if (template.nonblocking || req.params.nonblocking) {

    query(q, params, req.params.statement_timeout || template.statement_timeout)

    return res.send('Non blocking request sent.')
  }

  const rows = await query(q, params, req.params.statement_timeout || template.statement_timeout)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // return 202 if no record was returned from database.
  if (!rows || !rows.length) return res.status(202).send('No rows returned from table.')

  const checkEmptyRow = row => typeof row === 'object' && Object.values(row).some(val => val !== null)

  if (rows.length && !rows.some(row => checkEmptyRow(row)) || !checkEmptyRow(rows)) {
    return res.status(202).send('No rows returned from table.')
  }

  // Send the infoj object with values back to the client.
  res.send(rows.length === 1 && rows[0] || rows)
  
}