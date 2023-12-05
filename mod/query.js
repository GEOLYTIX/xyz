const dbs_connections = require('./utils/dbs')

const sqlFilter = require('./utils/sqlFilter')

const Roles = require('./utils/roles')

const logger = require('./utils/logger');

const login = require('./user/login')

const workspaceCache = require('./workspace/cache')

const getTemplate = require('./workspace/getTemplate')

const getLayer = require('./workspace/getLayer');

module.exports = async (req, res) => {

  // Get workspace from cache.
  const workspace = await workspaceCache()

  // Check whether query template exists.
  if (!Object.hasOwn(workspace.templates, req.params.template)) {

    return res.status(404).send('Template not found.')
  }

  // Get the template.
  const template = await getTemplate(workspace.templates[req.params.template])

  if (template.err) return res.status(500).send(template.err.message)

  // The template requires user login.
  if (!req.params.user && (template.login || template.admin || template.roles)) {

    req.params.msg = 'login_required'
    login(req, res)
    return
  }

  // The template requires the admin role for the user.
  if (!req.params.user?.admin && template.admin) {

    req.params.msg = 'admin_required'
    login(req, res)
    return
  }

  // Validate template role access.
  if (template.roles && !Roles.check(template, req.params.user?.roles)) {

    return res.status(403).send('Role access denied for query template.')
  }

  // Array of params for parameterized queries with node-pg.
  if (!Array.isArray(req.params.SQL)) {
    // If req.params.SQL is not an array, initialize it as an empty array
    req.params.SQL = [];
  }

  if (req.params.layer) {

    // Assign role filter and viewport params from layer object.
    await layerQuery(req, res)

  } else {

    // Reserved params will be deleted to prevent DDL injection.
    delete req.params.filter
    delete req.params.viewport
  }

  // Assign body to params to enable reserved %{body} parameter.
  req.params.body = req.params.stringifyBody && JSON.stringify(req.body) || req.body

  logger(req.params, 'query_params')

  let query;

  // Render the query string from tbe template and request params.
  try {
    if (typeof template.render === 'function') {

      req.params.workspace = workspace
      template.template = template.render(req.params)
    }

    if (!template.template) {

      return res.status(400).send('Unable to parse template string.')
    }

    // Reserved params may not be substituted.
    const reserved = new Set(['viewport', 'filter'])

    query = template.template

      // Replace parameter for identifiers, e.g. table, schema, columns
      .replace(/\$\{{1}(.*?)\}{1}/g, matched => {

        // Remove template brackets from matched param.
        const param = matched.replace(/\$\{{1}|\}{1}/g, '')

        // Get param value from request params object.
        const change = req.params[param] || ''

        // Change value may only contain a limited set of whitelisted characters.
        if (!reserved.has(param) && !/^[A-Za-z0-9,"'._-\s]*$/.test(change)) {

          // Err and return empty string if the change value is invalid.
          console.error('Change param no bueno')
          return ''
        }

        return change
      })

      // Replace params with placeholder, eg. $1, $2
      .replace(/\%{{1}(.*?)\}{1}/g, matched => {

        // Remove template brackets from matched param.
        const param = matched.replace(/\%\{{1}|\}{1}/g, '')

        var val = req.params[param]// || ""

        if (req.params.wildcard) {

          val = val.replaceAll(req.params.wildcard, '%')
        }

        try {

          // Try to parse val if the string begins and ends with either [] or {}
          val = !param === 'body' && /^[\[\{]{1}.*[\]\}]{1}$/.test(val) && JSON.parse(val) || val

        } catch (err) {
          console.error(err)
        }

        // Push value from request params object into params array.
        req.params.SQL.push(val)

        return `$${req.params.SQL.length}`
      })

    logger(query, 'query')

  } catch (err) {
    res.status(500).send(err.message)
    return console.error(err)
  }

  // The dbs param or workspace dbs will be used as fallback if the dbs is not implicit in the template object.
  const dbs_connection = String(template.dbs || req.params.dbs || workspace.dbs);

  // Validate that the dbs_connection string exists as a stored connection method in dbs_connections.
  if (!Object.hasOwn(dbs_connections, dbs_connection)) {

    return res.status(400).send(`Failed to validate database connection method.`)
  }

  // Get query pool from dbs module.
  const dbs = dbs_connections[dbs_connection]

  // Nonblocking queries will not wait for results but return immediately.
  if (req.params.nonblocking || template.nonblocking) {

    dbs(
      query,
      req.params.SQL,
      req.params.statement_timeout || template.statement_timeout)

    return res.send('Non blocking request sent.')
  }


  // Run the query
  let rows = await dbs(
    query,
    req.params.SQL,
    req.params.statement_timeout || template.statement_timeout);


  if (rows instanceof Error) {

    return res.status(500).send('Failed to query PostGIS table.');
  }

  // return 202 if no record was returned from database.
  if (!rows || !rows.length) return res.status(202).send('No rows returned from table.')

  function checkEmptyRow(row) {

    // row is typeof object with at least some value which is not null.
    return typeof row === 'object' && Object.values(row).some(val => val !== null)
  }

  // Check whether any row of the rows array is empty or whether a single row is empty.
  if (rows.length && !rows.some(row => checkEmptyRow(row)) || !checkEmptyRow(rows)) {

    return res.status(202).send('No rows returned from table.')
  }

  if (req.params.reduce || template?.reduce) {

    // Reduce row values to an values array.
    return res.send(rows.map(row => Object.values(row)))
  }

  if (req.params.value_only || template?.value_only) {

    return res.send(Object.values(rows[0])[0])
  }

  // Send the infoj object with values back to the client.
  res.send(rows.length === 1 && rows[0] || rows)
}

async function layerQuery(req, res) {

  // Assign layer object to req.params.
  req.params.layer = await getLayer(req.params)

  if (req.params.layer instanceof Error) {
    return res.status(400).send('Failed to access layer.')
  }

  if (!Roles.check(req.params.layer, req.params.user?.roles)) {
    return res.status(403).send('Role access denied for layer.')
  }

  // Set layer dbs as fallback if not implicit.
  req.params.dbs ??= req.params.layer.dbs

  // Layer queries must have a qID param.
  req.params.qID ??= req.params.layer.qID || 'NULL'

  // Layer queries must have an srid param.
  req.params.srid ??= req.params.layer.srid

  // Layer queries must have a geom param.
  req.params.geom ??= req.params.layer.geom

  // Get array of role filter from layer configuration.
  const roles = Roles.filter(req.params.layer, req.params.user?.roles)

  // Create params filter string from roleFilter filter params.
  req.params.filter =
    ` ${req.params.layer.filter?.default && 'AND ' + req.params.layer.filter?.default || ''}
    ${req.params.filter && `AND ${sqlFilter(JSON.parse(req.params.filter), req.params.SQL)}` || ''}
    ${roles && Object.values(roles).some(r => !!r)
      ? `AND ${sqlFilter(Object.values(roles).filter(r => !!r), req.params.SQL)}`
      : ''}`

  if (req.params.viewport) {

    const viewport = req.params.viewport?.split(',')

    // Assign viewport SQL string
    req.params.viewport &&= `
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
            ${req.params.srid}
          ),
          ${req.params.geom}
        )`
  }
}
