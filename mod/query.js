const dbs_connections = require('./utils/dbs')()

const sqlFilter = require('./utils/sqlFilter')

const Roles = require('./utils/roles.js')

const logger = require("./utils/logger");

module.exports = async (req, res) => {

  const template = req.params.template

  // Array of params for parameterized queries with node-pg.
  const SQLparams = []

  // A query template is required.
  if (!template) return res.status(400).send('Missing query template.')

  // Assign role filter and viewport params from layer object.
  if (req.params.layer) {

    // Get locale for layer.
    const locale = req.params.workspace.locales[req.params.locale]

    // A layer must be found if the layer param is set.
    if (!locale) return res.status(400).send('Locale not found.')

    // Get layer from locale.
    const layer = locale.layers[req.params.layer]

    // A layer must be found if the layer param is set.
    if (!layer) return res.status(400).send('Layer not found.')

    // Set layer dbs as fallback param if not defined.
    req.params.dbs = req.params.dbs || layer.dbs

    // Get array of role filter from layer configuration.
    const roles = Roles.filter(layer, req.params.user && req.params.user.roles)

    // Access is prohibited if the layer has roles assigned but the roleFilter is falsy.
    if (!roles && layer.roles) return res.status(403).send('Access prohibited.');

    // Create params filter string from roleFilter filter params.
    req.params.filter =
      ` ${layer.filter?.default && 'AND ' + layer.filter?.default || ''}
      ${req.params.filter && `AND ${sqlFilter(JSON.parse(req.params.filter), SQLparams)}` || ''}
      ${roles && Object.values(roles).some(r => !!r)
      && `AND ${sqlFilter(Object.values(roles).filter(r => !!r), SQLparams)}`
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

    // Reserved params will be deleted to prevent DDL injection.
    delete req.params.filter
    delete req.params.viewport
  }

  // Get query pool from dbs module.
  const dbs = dbs_connections[template.dbs || req.params.dbs]

  if (!dbs) return res.status(400).send(`DBS connection not found.`)

  // Assign body to params to enable reserved %{body} parameter.
  req.params.body = req.params.stringifyBody && JSON.stringify(req.body) || req.body

  logger(req.params, 'query_params')

  // Reserved param keys may not be substituted from request query params.
  const reserved = new Set(['viewport', 'filter'])

  let query;

  // Render the query string q from tbe template and request params.
  try {
    template.template = template.render && template.render(req.params) || template.template

    query = template.template

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

        var val = req.params[param] || ""

        try {

          // Try to parse val if the string begins and ends with either [] or {}
          val = !param === 'body' && /^[\[\{].*[\]\}]$/.test(val) && JSON.parse(val) || val
        } catch (err) {
          console.error(err)
        }

        // Push value from request params object into params array.
        SQLparams.push(val)

        return `\$${SQLparams.length}`
      })

    logger(query, 'query')

  } catch (err) {
    res.status(500).send(err.message)
    return console.error(err)
  }

  // Nonblocking queries will not wait for results but return immediately.
  if (template.nonblocking || req.params.nonblocking) {

    dbs(query, SQLparams, req.params.statement_timeout || template.statement_timeout)

    return res.send('Non blocking request sent.')
  }

  const rows = await dbs(query, SQLparams, req.params.statement_timeout || template.statement_timeout)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // return 202 if no record was returned from database.
  if (!rows || !rows.length) return res.status(202).send('No rows returned from table.')

  // Checks whether row is an object with at least some value on any key.
  const checkEmptyRow = row => typeof row === 'object'
    && Object.values(row).some(val => val !== null)

  // Check whether any row of the rows array is empty.
  if (rows.length && !rows.some(row => checkEmptyRow(row))
  
    // Check whether a single rows is empty.
    || !checkEmptyRow(rows)) {
      
    return res.status(202).send('No rows returned from table.')
  }

  // Send the infoj object with values back to the client.
  res.send(rows.length === 1 && rows[0] || rows)

}