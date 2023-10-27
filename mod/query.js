const dbs_connections = require('./utils/dbs')()

const sqlFilter = require('./utils/sqlFilter')

const Roles = require('./utils/roles.js')

const logger = require('./utils/logger');

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

    if (!Object.hasOwn(locale.layers, req.params.layer)) {

      return res.status(400).send('Layer not found.')
    }

    // Get layer from locale.
    const layer = Roles.check(locale.layers[req.params.layer], req.params.user?.roles)

    if (!layer) {

      return res.status(403).send('Access prohibited.')
    }

    // Set layer dbs as fallback param if not defined.
    req.params.dbs = req.params.dbs || layer.dbs

    // Get array of role filter from layer configuration.
    const roles = Roles.filter(layer, req.params.user?.roles)

    // Create a params filter string from roleFilter filter params.
    // Include 'AND' followed by layer.filter?.default if it exists.
    const layerFilterPart = layer.filter?.default ? `AND ${layer.filter.default}` : '';
    console.log('layerFilterPart', layerFilterPart);
    // Include 'AND' followed by the result of sqlFilter if req.params.filter is provided.
    console.log('Filter', req.params.filter);
    const reqFilterPart = req.params.filter ? `AND ${sqlFilter(JSON.parse(req.params.filter), SQLparams)}` : '';
    console.log('reqFilterPart', reqFilterPart);
    // Include 'AND' followed by the result of sqlFilter applied to roles with truthy values.
    const rolesFilterPart = roles && Object.values(roles).some(r => !!r)
      ? `AND ${sqlFilter(Object.values(roles).filter(r => !!r), SQLparams)}`
      : '';
    console.log('rolesFilterPart', rolesFilterPart);
    // Combine the parts into a single filter string with spaces.
    req.params.filter = `${layerFilterPart} ${reqFilterPart} ${rolesFilterPart}`;
    console.log('req.params.filter', req.params.filter);

    // Split viewport param.
    const viewport = req.params.viewport?.split(',')

    // Assign viewport SQL
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
            ${req.params.srid || layer.srid}),
          ${req.params.geom || layer.geom}
        )`

    req.params.qID = req.params.qID || layer.qID || 'NULL'

  } else {

    // Reserved params will be deleted to prevent DDL injection.
    delete req.params.filter
    delete req.params.viewport
  }

  // Assign body to params to enable reserved %{body} parameter.
  req.params.body = req.params.stringifyBody && JSON.stringify(req.body) || req.body

  logger(req.params, 'query_params')

  // Reserved param keys may not be substituted from request query params.
  const reserved = new Set(['viewport', 'filter'])

  let query;

  // Render the query string q from tbe template and request params.
  try {
    template.template = template.render && template.render(req.params) || template.template

    if (!template.template) {

      return res.status(400).send('Unable to parse template string.')
    }

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
        SQLparams.push(val)

        return `\$${SQLparams.length}`
      })

    logger(query, 'query')

  } catch (err) {
    res.status(500).send(err.message)
    return console.error(err)
  }

  // The dbs param or workspace dbs will be used as fallback if the dbs is not implicit in the template object.
  const dbs_connection = String(template.dbs || req.params.dbs || req.params.workspace.dbs);

  // Validate that the dbs_connection string exists as a stored connection method in dbs_connections.
  if (!Object.hasOwn(dbs_connections, dbs_connection)) {

    return res.status(400).send(`Failed to validate database connection method.`)
  }

  // Get query pool from dbs module.
  const dbs = dbs_connections[dbs_connection]

  // Nonblocking queries will not wait for results but return immediately.
  if (template.nonblocking || req.params.nonblocking) {

    dbs(query, SQLparams, req.params.statement_timeout || template.statement_timeout)

    return res.send('Non blocking request sent.')
  }

  let rows = await dbs(query, SQLparams, req.params.statement_timeout || template.statement_timeout);

  if (rows instanceof Error) {

    return res.status(500).send('Failed to query PostGIS table.');
  }

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

  if (req.params.reduced || req.params.template?.reduce) {

    // Reduce row values to an values array.
    return res.send(rows.map(row => Object.values(row)))
  }

  // Send the infoj object with values back to the client.
  res.send(rows.length === 1 && rows[0] || rows)

}