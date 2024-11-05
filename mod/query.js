/**
The query module exports the [SQL] query method to pass queries to the stored dbs_connections available to the XYZ instance.

@requires /utils/dbs
@requires /utils/sqlFilter
@requires /utils/roles
@requires /utils/logger
@requires /workspace/cache
@requires /workspace/getTemplate
@requires /workspace/getLayer

@module /query
*/

const dbs_connections = require('./utils/dbs')

const sqlFilter = require('./utils/sqlFilter')

const Roles = require('./utils/roles')

const logger = require('./utils/logger');

const login = require('./user/login')

const workspaceCache = require('./workspace/cache')

const getTemplate = require('./workspace/getTemplate')

const getLayer = require('./workspace/getLayer');

/**
@function query
@async

@description
The [SQL] query method requests a query template from the getTemplate method and checks whether the requesting user is permitted to execute the query.

The layerQuery() method must be awaited for queries that reference a layer.

A template is turned into a query by the getQueryFromTemplate() method.

The query is executed by the executeQuery() method.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params Request params.
@property {Object} [params.user] Requesting user.
@property {Array} [user.roles] User roles.
*/
module.exports = async function query(req, res) {

  // Get the template.
  const template = await getTemplate(req.params.template)

  if (template instanceof Error) {
    return res.status(500).send(template.message)
  }

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

  // The SQL param is restricted to hold substitute values.
  req.params.SQL = [];

  // Get workspace from cache.
  req.params.workspace = await workspaceCache()

  // Assign role filter and viewport params from layer object.
  await layerQuery(req, res, template)

  if (res.finished) return;

  await fieldsParam(req, res)

  // Assign body to params to enable reserved %{body} parameter.
  req.params.body = req.params.stringifyBody && JSON.stringify(req.body) || req.body

  logger(req.params, 'query_params')

  const query = await getQueryFromTemplate(req, template)

  executeQuery(req, res, template, query)
}

/**
@function layerQuery
@async

@description
Queries which reference a layer must be checked against the layer JSON in the workspace.

Layer query templates must have a layer request property.

Layer queries have restricted viewport and filter params. These params can not be substituted in the database but must be replaced in the SQL query string.

Any query which references a layer and locale will be passed through the layer query method. The getLayer method will fail return an error if the locale is not defined as param or the layer is not a member of the locale.

```
/api/query?template=query&locale=uk&layer=retail
```

The fields request param property may be provided as an array. The string should be replaced with the template property of a matching workspace template.

@param {req} req HTTP request.
@param {res} res HTTP response.
@param {Object} template The query template.
@property {Boolean} template.layer A layer query template.
@property {Object} req.params Request params.
@property {Object} params.filter JSON filter which must be turned into a SQL filter string for substitution.
@property {Array} params.SQL Substitute parameter for SQL query.
@property {Array} params.fields An array of string fields is provided for a layer query.
@property {Object} [params.user] Requesting user.
@property {Array} [user.roles] User roles.
*/
async function layerQuery(req, res, template) {

  if (!req.params.layer) {

    if (template.layer) {

      // Layer query templates must have a layer request property.
      return res.status(400).send(`${req.params.template} query requires a valid layer request parameter.`)
    }

    // Reserved params will be deleted to prevent DDL injection.
    delete req.params.filter
    delete req.params.viewport
    return;
  }

  // Assign layer object to req.params.
  req.params.layer = await getLayer(req.params)

  // getLayer will return error on role restrictions.
  if (req.params.layer instanceof Error) {
    return res.status(400).send(req.params.layer.message)
  }

  // Layer queries must have a qID param.
  req.params.qID ??= req.params.layer.qID || 'NULL'

  // Layer queries must have an srid param.
  req.params.srid ??= req.params.layer.srid

  // Layer queries must have a geom param.
  req.params.geom ??= req.params.layer.geom

  // Create filter condition for SQL query.
  req.params.filter = [
    req.params.layer.filter?.default && `AND ${sqlFilter(req.params.layer.filter.default, req.params.SQL)}` || '',
    req.params.filter && `AND ${sqlFilter(JSON.parse(req.params.filter), req.params.SQL)}` || '']
    .join(' ')

  // Create viewport condition for SQL query.
  if (req.params.viewport) {

    const viewport = req.params.viewport?.split(',')

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

/**
@function fieldsParam
@async

@description
The fields request param property may be provided as an array. The string should be replaced with the template property of a matching workspace template.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Array} params.fields An array of string fields is provided for a layer query.
*/
async function fieldsParam(req, res) {

  if (!req.params.fields) return;

  const fields = req.params.fields.split(',')
  
  //if (!Array.isArray(req.params.fields)) return;

  req.params.fieldsMap = new Map();

  for (const field of fields) {

    console.log(field)

    req.params.fieldsMap.set(field, field)
  }
}

/**
@function getQueryFromTemplate

@description
In order to prevent SQL injections queries must be build from templates stored in the workspace.templates{}.

A template may have a render method which returns a query string assigned as template.template.

Parameter to be replaced in the SQL query string must be checked to only contain whitelisted character to prevent SQL injection.

Any variables to be replaced on query execution in the database must be replaced with indices in the query string. eg. $1, $2, ...

The substitute values are stored in the ordered params.SQL[] array.

An error will be returned if the substitution fails.

@param {req} req HTTP request.
@param {Object} template Request template.
@property {Object} req.params Request params.
@property {Object} params.filter JSON filter which must be turned into a SQL filter string for substitution.
@property {Array} params.SQL Substitute parameter for SQL query.
@property {Function} template.render Method to render template string.
@property {string} template.template SQL template string.
*/
function getQueryFromTemplate(req, template) {

  try {

    if (typeof template.render === 'function') {

      // Render template string from template.render() function.
      template.template = template.render(req.params)
    }

    // The template object must have a [SQL] template string.
    if (typeof template.template !== 'string') {

      return new Error('Unable to parse template string.')
    }

    // The sqlFilter must not override the filter set by the layer query.
    if (req.params.sqlFilter) {
      req.params.filter = req.params.filter
        || `AND ${sqlFilter(JSON.parse(req.params.sqlFilter), req.params.SQL)}`
    }

    // Returns -1 if ${filter} not found in template
    if (template.template.search(/\$\{filter\}/) < 0) {

      // Ensure that the $n substitute params match the SQL length on layer queries without a ${filter}
      delete req.params.filter
      //We remove the SQL params because there is no filter at this stage so we don't have any values to substitute.
      //If there are any other substitues they get added after.
      req.params.SQL.length = 0
    }

    const query_template = template.template

      // Replace parameter for identifiers, e.g. table, schema, columns
      .replace(/\$\{{1}(.*?)\}{1}/g, matched => {

        // Remove template brackets from matched param.
        const param = matched.replace(/\$\{{1}|\}{1}/g, '')

        // Get param value from request params object.
        const change = req.params[param] || ''

        // Change value may only contain a limited set of whitelisted characters.
        if (!new Set(['viewport', 'filter']).has(param) && !/^[A-Za-z0-9,"'._-\s]*$/.test(change)) {

          throw new Error(`Substitute \${${param}} value rejected: ${change}`);
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
        req.params.SQL.push(val);

        return `$${req.params.SQL.length}`
      })

    return query_template

  } catch (err) {

    return err
  }
}

/**
@function executeQuery
@async

@description
The method send a parameterised query to a database connection.

The dbs for the query is determined primarily by the template. The layer.dbs is used for layer queries if the dbs on the template is not implicit. The locale.dbs is assumed as the layer.dbs if not defined in JSON layer. The workspace.dbs will be used as fallback if no template, layer, or locale dbs can be determined.

@param {req} req HTTP request.
@param {res} res HTTP response.
@param {Object} template Request template.
@param {string} query SQL query.
@property {Object} [req.params] Request params.
*/
async function executeQuery(req, res, template, query) {

  logger(query, 'query')

  if (query instanceof Error) {

    return res.status(400).send(query.message);
  }

  // The dbs param or workspace dbs will be used as fallback if the dbs is not implicit in the template object.
  const dbs = String(template.dbs || req.params.layer?.dbs || req.params.workspace.dbs);

  // Validate that the dbs string exists as a stored connection method in dbs_connections.
  if (!Object.hasOwn(dbs_connections, dbs)) {

    return res.status(400).send(`Failed to validate database connection method.`)
  }

  // Return without executing the query if a param errs.
  if (req.params.SQL.some(param => param instanceof Error)) {

    const paramsArray = req.params.SQL.map(param => param instanceof Error ? param.message : param)

    paramsArray.unshift('Parameter validation failed.')

    res.status(500).send(paramsArray)
    return;
  }

  // Nonblocking queries will not wait for results but return immediately.
  if (req.params.nonblocking || template.nonblocking) {

    dbs_connections[dbs](
      query,
      req.params.SQL,
      req.params.statement_timeout || template.statement_timeout)

    return res.send('Non blocking request sent.')
  }

  // Run the query
  const rows = await dbs_connections[dbs](
    query,
    req.params.SQL,
    req.params.statement_timeout || template.statement_timeout);

  sendRows(req, res, template, rows)
}

/**
@function sendRows

@description
The method formats the rows returned from a SQL query and sends the formated rows through the HTTP response object.

@param {req} req HTTP request.
@param {res} res HTTP response.
@param {Object} template Request template.
@param {array} rows The response from a SQL query.
*/
function sendRows(req, res, template, rows) {

  if (rows instanceof Error) {

    return res.status(500).send('Failed to query PostGIS table.');
  }

  // return 202 if no record was returned from database.
  if (!rows || !rows.length) return res.status(202).send('No rows returned from table.')

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

function checkEmptyRow(row) {

  // row is typeof object with at least some value which is not null.
  return typeof row === 'object' && Object.values(row).some(val => val !== null)
}
