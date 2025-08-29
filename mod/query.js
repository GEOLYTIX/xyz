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

import login from './user/login.js';
import dbs_connections from './utils/dbs.js';
import logger from './utils/logger.js';
import * as Roles from './utils/roles.js';
import sqlFilter from './utils/sqlFilter.js';

import workspaceCache from './workspace/cache.js';
import getLayer from './workspace/getLayer.js';
import getTemplate from './workspace/getTemplate.js';

/**
@function query
@async

@description
The [SQL] query method requests a query template from the getTemplate method and checks whether the requesting user is permitted to execute the query.

The layerQuery() method must be awaited for queries that reference a layer. The layerQuery must be run before the getTemplate() request since the query template may be defined in the layer [template].

A template is turned into a query by the getQueryFromTemplate() method.

The query is executed by the executeQuery() method.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params Request params.
@property {Object} [params.user] Requesting user.
@property {Array} [user.roles] User roles.
*/
export default async function query(req, res) {
  // Get workspace from cache.
  req.params.workspace = await workspaceCache();

  // The SQL param is restricted to hold substitute values.
  req.params.SQL = [];

  // Assign role filter and viewport params from layer object.
  await layerQuery(req, res);

  if (res.finished) return;

  // Get the template.
  const template = await getTemplate(req.params.template);

  if (template.err instanceof Error) {
    return res
      .status(500)
      .setHeader('Content-Type', 'text/plain')
      .send(template.err.message);
  }

  // A layer template must have a layer param.
  if (template.layer && !req.params.layer) {
    return res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send(
        `${req.params.template} query requires a valid layer request parameter.`,
      );
  }

  // The template requires user login.
  if (
    !req.params.user &&
    (template.login || template.admin || template.roles)
  ) {
    req.params.msg = 'login_required';
    login(req, res);
    return;
  }

  // The template requires the admin role for the user.
  if (!req.params.user?.admin && template.admin) {
    req.params.msg = 'admin_required';
    login(req, res);
    return;
  }

  // Validate template role access.
  if (template.roles && !Roles.check(template, req.params.user?.roles)) {
    return res
      .status(403)
      .setHeader('Content-Type', 'text/plain')
      .send('Role access denied for query template.');
  }

  if (res.finished) return;

  // Assign body to params to enable reserved %{body} parameter.
  req.params.body =
    (req.params.stringifyBody && JSON.stringify(req.body)) || req.body;

  logger(req.params, 'query_params');

  const query = await getQueryFromTemplate(req, template);

  executeQuery(req, res, template, query);
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
async function layerQuery(req, res) {
  if (req.params.layer_template) {
    req.params.layer = req.params.layer_template;
  }

  if (!req.params.layer) {
    // Reserved params will be deleted to prevent DDL injection.
    delete req.params.filter;
    delete req.params.viewport;
    return;
  } else if (typeof req.params.layer === 'string') {
    req.params.layer = await getLayer(req.params);
  }

  // getLayer will return error on role restrictions.
  if (req.params.layer instanceof Error) {
    return res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send(req.params.layer.message);
  }

  // Layer queries must have a qID param.
  req.params.qID ??= req.params.layer.qID;

  // Layer queries must have an srid param.
  req.params.srid ??= req.params.layer.srid;

  // Layer queries must have a geom param.
  req.params.geom ??= req.params.layer.geom;

  // Check whether table request param is referenced in layer.
  if (req.params.table) {
    const tables = new Set(templateTables(req.params.layer));

    if (!tables.has(req.params.table)) {
      return res
        .status(403)
        .setHeader('Content-Type', 'text/plain')
        .send(`Access to ${req.params.table} table param forbidden.`);
    }
  }

  // Create filter condition for SQL query.
  req.params.filter = [
    (req.params.layer.filter?.default &&
      `AND ${sqlFilter(req.params.layer.filter.default, req)}`) ||
      '',
    (req.params.filter &&
      `AND ${sqlFilter(JSON.parse(req.params.filter), req)}`) ||
      '',
  ].join(' ');

  // Create viewport condition for SQL query.
  if (req.params.viewport) {
    const viewport = req.params.viewport?.split(',');

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
        )`;
  }

  await fieldsMap(req, res);

  await infojMap(req, res);
}

/**
@function templateTables

@description
The methods call the internal getObjTables method to iterate through the [layer] template object argument and its nested propertiess. Any 'table' string properties and string values of a 'tables' object are pushed into tables array returned from the method.

@param {object} template [Layer] template object to parse for table strings.
@returns {Array} Array of table strings in layer template object.
*/
function templateTables(template) {
  const tables = [];

  getObjTables(template, tables);

  return tables;

  function getObjTables(obj, tables) {
    if (typeof obj !== 'object') return;

    // Return early if object is null or empty
    if (obj === null) return;

    // Object must have keys to iterate on.
    if (obj instanceof Object && !Object.keys(obj)) return;

    Object.entries(obj).forEach(([key, value]) => {
      if (key === 'table' && typeof value === 'string') {
        tables.push(value);
        return;
      }

      if (
        key === 'tables' &&
        value instanceof Object &&
        Object.keys(value).length
      ) {
        Object.values(value).forEach(
          (table) => typeof table === 'string' && tables.push(table),
        );
        return;
      }

      // Recursively process each item if we find an array
      if (Array.isArray(value)) {
        value.forEach((item) => getObjTables(item, tables));
        return;
      }

      // Recursively process nested objects
      if (value instanceof Object) {
        getObjTables(value, tables);
      }
    });
  }
}

/**
@function fieldsMap
@async

@description
The method assigns the fieldsMap object property to the request params for layer queries with a fields request parameter.

The fields param is split into an array and template strings of workspace.templates matching a field are set as value to the field key in the fieldsMap object.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params The request params.
@property {Array} params.fields An array of string fields is provided for a layer query.
*/
async function fieldsMap(req, res) {
  if (!req.params.fields) return;

  const fields = req.params.fields.split(',');

  req.params.fieldsMap = new Map();

  for (const field of fields) {
    let value = field;

    if (Object.hasOwn(req.params.workspace.templates, field)) {
      const fieldTemplate = await getTemplate(field);

      value = fieldTemplate.field || field;
    }

    req.params.fieldsMap.set(field, value);
  }
}

/**
@function infojMap
@async

@description
The method assigns the infojMap object property to the request params for layer requests.

The method iterates over the layer.infoj entries and only assigns entry fields valid for a location_get request.

A lookup of template [SQL] strings is attempted only if the template is defined in the entry object.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params The request params.
@property {Array} params.layer The layer object assigned by the layerQuery
*/
async function infojMap(req, res) {
  if (!req.params.layer?.infoj) return;

  req.params.infojMap = new Map();

  for (const entry of req.params.layer.infoj) {
    // An entry must have a field, and not a query.
    if (!entry.field || entry.query) continue;

    // Only entries with fields included in the fieldsMap should be added if a fieldsMap has been provided.
    if (req.params.fieldsMap && !req.params.fieldsMap?.has(entry.field))
      continue;

    // The fieldfx has precendence over templates.
    if (entry.fieldfx) {
      req.params.infojMap.set(entry.field, entry.fieldfx);
      continue;
    }

    let value = entry.field;

    // Check for workspace.template matching the entry.field.
    if (
      entry.template &&
      Object.hasOwn(req.params.workspace.templates, entry.field)
    ) {
      const fieldTemplate = await getTemplate(entry.field);

      // Core templates should not be included in the infojMap.
      if (fieldTemplate._type === 'core') {
        req.params.infojMap.set(entry.field, value);
        continue;
      }

      value = fieldTemplate.template || '';
    }

    req.params.infojMap.set(entry.field, value);
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
      template.template = template.render(req.params);
    }

    // The template object must have a [SQL] template string.
    if (typeof template.template !== 'string') {
      return new Error('Unable to parse template string.');
    }

    // The sqlFilter must not override the filter set by the layer query.
    if (req.params.sqlFilter) {
      req.params.filter =
        req.params.filter ||
        `AND ${sqlFilter(JSON.parse(req.params.sqlFilter), req)}`;
    }

    // Returns -1 if ${filter} not found in template
    if (template.template.search(/\${filter}/) < 0) {
      // Ensure that the $n substitute params match the SQL length on layer queries without a ${filter}
      delete req.params.filter;
      //We remove the SQL params because there is no filter at this stage so we don't have any values to substitute.
      //If there are any other substitues they get added after.
      req.params.SQL.length = 0;
    }

    const query_template = template.template

      // Replace parameter for identifiers, e.g. table, schema, columns
      .replace(/\${(.{0,99}?)}/g, (matched) => {
        // Remove template brackets from matched param.
        const param = matched.replace(/\${|}/g, '');

        // Get param value from request params object.
        const change = req.params[param] || '';

        // Change value may only contain a limited set of whitelisted characters.
        if (
          !new Set(['viewport', 'filter']).has(param) &&
          !/^[A-Za-z0-9,"'._-\s]*$/.test(change)
        ) {
          throw new Error(`Substitute \${${param}} value rejected: ${change}`);
        }

        return change;
      })

      // Replace params with placeholder, eg. $1, $2
      .replace(/%{(.{0,99}?)}/g, (matched) => {
        // Remove template brackets from matched param.
        const param = matched.replace(/%{|}/g, '');

        let val = req.params[param];

        if (req.params.wildcard) {
          val = val.replaceAll(req.params.wildcard, '%');
        }

        try {
          if (param !== 'body' && /^[[{].*[\]}]$/.test(val)) {
            // Parse val as JSON if param is not 'body' and the [string] value begins and ends with either [] or {}.
            val = JSON.parse(val);
          }
        } catch (err) {
          console.error(err);
        }

        // Push value from request params object into params array.
        req.params.SQL.push(val);

        return `$${Array.from(req.params.SQL).length}`;
      });

    return query_template;
  } catch (err) {
    return err;
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
  logger(query, 'query');

  if (query instanceof Error) {
    return res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send(query.message);
  }

  // The dbs param or workspace dbs will be used as fallback if the dbs is not implicit in the template object.
  const dbs = String(
    template.dbs || req.params.layer?.dbs || req.params.workspace.dbs,
  );

  // Validate that the dbs string exists as a stored connection method in dbs_connections.
  if (!Object.hasOwn(dbs_connections, dbs)) {
    return res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send('Failed to validate database connection method.');
  }

  // Return without executing the query if a param errs.
  if (req.params.SQL.some((param) => param instanceof Error)) {
    const paramsArray = req.params.SQL.map((param) =>
      param instanceof Error ? param.message : param,
    );

    paramsArray.unshift('Parameter validation failed.');

    res.status(500).setHeader('Content-Type', 'text/plain').send(paramsArray);
    return;
  }

  // Nonblocking queries will not wait for results but return immediately.
  if (req.params.nonblocking || template.nonblocking) {
    dbs_connections[dbs](
      query,
      req.params.SQL,
      req.params.statement_timeout || template.statement_timeout,
    );

    return res.send('Non blocking request sent.');
  }

  // Run the query
  const rows = await dbs_connections[dbs](
    query,
    req.params.SQL,
    req.params.statement_timeout || template.statement_timeout,
  );

  sendRows(req, res, template, rows);
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
    return res
      .status(500)
      .setHeader('Content-Type', 'text/plain')
      .send('Failed to query PostGIS table.');
  }

  // The rows array must have a length with some row not being empty.
  if (!rows?.length || !rows.some((row) => checkEmptyRow(row))) {
    return res
      .status(202)
      .setHeader('Content-Type', 'text/plain')
      .send('No rows returned from table.');
  }

  if (req.params.reduce || template?.reduce) {
    // Reduce row values to an values array.
    return res.send(rows.map((row) => Object.values(row)));
  }

  if (req.params.value_only || template?.value_only) {
    const value = Object.values(rows[0])[0];

    // Numeric values may not be returned with the res.send() method.
    if (typeof value === 'number') {
      return res.send(value.toString());
    }

    return res.send(value);
  }

  // Send the infoj object with values back to the client.
  res.send((rows.length === 1 && rows[0]) || rows);
}

function checkEmptyRow(row) {
  // row is typeof object with at least some value which is not null.
  return (
    typeof row === 'object' && Object.values(row).some((val) => val !== null)
  );
}
