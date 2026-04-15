/**
The query module exports the [SQL] query method to pass queries to dbs connections configured in the XYZ process environment.

@requires /user/login
@requires /utils/dbs
@requires /utils/logger
@requires /utils/roles
@requires /utils/sqlFilter
@requires /workspace/cache
@requires /workspace/getLayer
@requires /workspace/getTemplate

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

The layerQuery() method must be awaited to check whether params are referenced in a role restricted JSON layer.

The query method assigns and checks the dbs connection for the query template.

A query string must returned from the getQueryFromTemplate() method.

The query and SQL params to be substituted in the database process are send to the dbs_connection.

The rows returned from the dbs_connection are then passed to the sendRows() method.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params Request params.
@property {Object} [params.user] Requesting user.
@property {Array} [user.roles] User roles.
@property {boolean} [params.value_only] Return a single value from one row.
@property {boolean} [params.reduce] Reduce query response to a values array.
@property {boolean} [params.nonblocking] Execute a nonblocking query.
@property {integer} [params.statement_timeout] Timeout for database connection.
*/
export default async function query(req, res) {
  // Get workspace from cache.
  req.params.workspace = await workspaceCache();

  // Assign reserved request params.
  Object.assign(req.params, {
    infojMap: new Map(),
    missing: [],
    optional: new Set(['viewport', 'filter']),
    SQL: [],
  });

  await layerQuery(req, res);

  // The layerQuery method will have sent an error response.
  if (res.finished) return;

  // Must be run after the layerQuery method since the query template could be defined within the layer [template].
  const template = await getTemplate(req.params.template);

  if (template.err instanceof Error) {
    res
      .status(500)
      .setHeader('Content-Type', 'text/plain')
      .send(template.err.message);
    return;
  }

  // A layer template must have a layer param.
  if (template.layer && !req.params.layer) {
    res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send(
        `${req.params.template} query requires a valid layer request parameter.`,
      );
    return;
  }

  // The template requires user login.
  if (template.roles && !req.params.user) {
    req.params.msg = 'login_required';
    login(req, res);
    return;
  }

  // The template requires the admin role for the user.
  if (template.admin && !req.params.user?.admin) {
    req.params.msg = 'admin_required';
    login(req, res);
    return;
  }

  // Validate template role access.
  if (!Roles.check(template, req.params.user?.roles)) {
    res
      .status(403)
      .setHeader('Content-Type', 'text/plain')
      .send('Role access denied for query template.');
    return;
  }

  // Use layer dbs as fallback if template dbs is not defined.
  template.dbs ??= req.params.layer?.dbs;

  // Use workspace dbs as fallback if not explicit or from layer.
  template.dbs ??= req.params.workspace.dbs;

  // Validate that the dbs string exists as a stored connection method in dbs_connections.
  if (!Object.hasOwn(dbs_connections, template.dbs)) {
    res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send('Failed to validate database connection method.');
    return;
  }

  template.value_only ??= req.params.value_only;

  template.reduce ??= req.params.reduce;

  template.nonblocking ??= req.params.nonblocking;

  template.statement_timeout ??= req.params.statement_timeout;

  logger(req.params, 'query_params');

  const query = getQueryFromTemplate(req, template);

  if (query instanceof Error) {
    res.status(400).setHeader('Content-Type', 'text/plain').send(query.message);
    return;
  }

  logger(query, 'query');

  // Nonblocking queries will not wait for results but return immediately.
  if (template.nonblocking) {
    dbs_connections[template.dbs](
      query,
      req.params.SQL,
      template.statement_timeout,
    );

    return res.send('Non blocking request sent.');
  }

  // Run the query
  const rows = await dbs_connections[template.dbs](
    query,
    req.params.SQL,
    template.statement_timeout,
  );

  sendRows(res, template, rows);
}

/**
@function layerQuery
@async

@description
Queries which reference a layer must be checked against the layer JSON in the workspace.

Layer query templates must have a layer request property.

Layer queries have restricted viewport and filter params. These params can not be substituted in the database but must be replaced in the SQL query string.

Any query which references a layer and locale will be passed through the layer query method. The getLayer method will fail return an error if the locale is not defined as param or the layer is not a member of the locale.

The fields request param property may be provided as an array. The string should be replaced with the template property of a matching workspace template.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {object} req.params Request params.
@property {object} [params.filter] JSON filter which must be turned into a SQL filter string for substitution.
@property {array} params.SQL Substitute parameter for SQL query.
@property {string} [params.viewport] Viewport string to be split into an array to create a SQL viewport.
@property {object} [params.user] Requesting user.
@property {string} [params.layer_template] A layer can be loaded directly from a template not referenced in a locale.
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
    res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send(req.params.layer.message);
    return;
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
      res
        .status(403)
        .setHeader('Content-Type', 'text/plain')
        .send(`Access to ${req.params.table} table param forbidden.`);
      return;
    }
  }

  // Defined in the layer a default filter cannot be altered by the request.
  const filterDefault = req.params.layer.filter?.default
    ? `AND ${sqlFilter(req.params.layer.filter.default, req)}`
    : '';

  // The current filter is defined in the request params.
  const filterCurrent = req.params.filter
    ? `AND ${sqlFilter(JSON.parse(req.params.filter), req)}`
    : '';

  // Create filter condition for SQL query.
  req.params.filter = `${filterDefault} ${filterCurrent}`;

  // Create viewport condition for SQL query.
  if (req.params.viewport) {
    const viewport = req.params.viewport.split(',');

    req.params.viewport = `AND
      ST_Intersects(
        ST_Transform(
          ST_MakeEnvelope(
            ${viewport[0]},
            ${viewport[1]},
            ${viewport[2]},
            ${viewport[3]},
            ${Number.parseInt(viewport[4])}),
          ${req.params.srid}),
        ${req.params.geom})`;
  }

  checkFieldsParam(req, res);

  // The checkFieldsParam method will have sent an error response.
  if (res.finished) return;

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

  for (const table of tables) {
    const schema_table = table.split('.');
    if (schema_table.length === 2) tables.push(schema_table[1]);
  }

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
@function checkFieldsParam
@async

@description
Layer queries should restrict the fields provided as param to query templates.

The method will call the recursive objPropValueSet method to parse the layer object for any values referenced as properties with the 'field' key.

Field values may not be referenced in the layer object from role restricted templates.

The method will return an Error if the fields request param contains a string value which is not referenced in a field prooperty in the layer object.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {object} req.params The request object params.
@property {string} [params.fields] The request layer object [from template].
@property {object} params.layer The request layer object [from template].
@returns {Error} An error will be returned if the check fails.
*/
async function checkFieldsParam(req, res) {
  if (!req.params.fields) return;

  const layerFields = new Set();

  objPropValueSet(req.params.layer, 'field', layerFields);

  req.params.fieldsMap = new Map();

  for (const field of req.params.fields.split(',')) {
    if (!layerFields.has(field)) {
      const err = new Error(
        `${field} field not accessible on ${req.params.layer.key} layer`,
      );
      console.error(err);
      res.status(400).setHeader('Content-Type', 'text/plain').send(err.message);
      return;
    }

    let value = field;

    if (Object.hasOwn(req.params.workspace.templates, field)) {
      const fieldTemplate = await getTemplate(field);

      value = fieldTemplate.field || field;
    }

    req.params.fieldsMap.set(field, value);
  }
}

/**
@function objPropValueSet

@description
The recursive method parses all properties in an object and calls itself if the property value is an object.

String values of object properties with the key matching the prop argument will be added to the set argument.

@param {object} obj Object to parse for property values.
@param {string} prop The property key.
@param {set} set The set to which the property values should be added.
*/
function objPropValueSet(obj, prop, set) {
  if (typeof obj !== 'object') return;

  // Return early if object is null or empty
  if (obj === null) return;

  // Object must have keys to iterate on.
  if (obj instanceof Object && !Object.keys(obj)) return;

  for (const [key, value] of Object.entries(obj)) {
    if (key === prop && typeof value === 'string') {
      set.add(value);
      continue;
    }

    // Recursively process each item if we find an array
    if (Array.isArray(value)) {
      value.forEach((item) => objPropValueSet(item, prop, set));
      continue;
    }

    // Recursively process nested objects
    if (value instanceof Object) {
      objPropValueSet(value, prop, set);
    }
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
@property {object} req.params The request params.
@property {object} params.layer The layer object assigned by the layerQuery
*/
async function infojMap(req, res) {
  if (!req.params.layer.infoj) return;

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
The method will assign the body param from the request body object in a post query.

The template.render method will be called to return a query string.

An error will be returned if the template object does not have a template string.

Varibles must be replaced or substituted in query string to prevent SQL injections.

Parameter to be replaced in the SQL query string must be checked to only contain whitelisted character to prevent SQL injection.

Any variables to be replaced on query execution in the database must be replaced with indices in the query string. eg. $1, $2, ...

The substitute values are stored in the ordered params.SQL[] array.

An error will be returned if the substitution fails.

@param {req} req HTTP request.
@param {object} template Request template.
@property {object} [req.body] Post request body.
@property {object} req.params Request params.
@property {object} [params.filter] JSON filter which must be turned into a SQL filter string for substitution.
@property {array} params.SQL Substitute parameter for SQL query.
@property {string} [params.sqlFilter] A string which must be parsed as JSON to create a SQL filter string.
@property {function} [template.render] Method to render template string.
@property {string} template.template SQL template string.
@returns {string} A PostgreSQL query string.
*/
function getQueryFromTemplate(req, template) {
  if (req.body) {
    // Assign body to params to enable reserved %{body} parameter.
    req.params.body = req.params.stringifyBody
      ? JSON.stringify(req.body)
      : req.body;
  }

  try {
    if (typeof template.render === 'function') {
      // Render template string from template.render() function.
      template.template = template.render(req.params);
    }

    // The template object must have a [SQL] template string.
    if (typeof template.template !== 'string') {
      return new Error('Unable to parse template string.');
    }

    if (req.params.sqlFilter) {
      // The sqlFilter must not override the filter set by the layer query.
      req.params.filter ??= `AND ${sqlFilter(JSON.parse(req.params.sqlFilter), req)}`;
    }

    // Returns -1 if ${filter} not found in template
    if (template.template.search(/\${filter}/) < 0) {
      // Ensure that the $n substitute params match the SQL length on layer queries without a ${filter}
      delete req.params.filter;
      //We remove the SQL params because there is no filter at this stage so we don't have any values to substitute.
      //If there are any other substitues they get added after.
      req.params.SQL.length = 0;
    }

    // Replace ${param} with string
    let query_template = template.template.replace(
      /\${(.{0,99}?)}/g,
      (matched) => replaceStringParams(req, matched),
    );

    // Replace %{param} with placeholder, eg. $1, $2
    query_template = query_template.replace(/%{(.{0,99}?)}/g, (matched) =>
      replaceValueParams(req, matched),
    );

    if (req.params.missing.length > 0) {
      throw new Error(
        `${template.key} has missing params: ${req.params.missing}`,
      );
    }

    // Check whether params.SQL contains an error.
    if (req.params.SQL.some((param) => param instanceof Error)) {
      const paramsArray = req.params.SQL.map((param) =>
        param instanceof Error ? param.message : param,
      );
      paramsArray.unshift('Parameter validation failed.');
      throw new Error(paramsArray);
    }

    return query_template;
  } catch (err) {
    return err;
  }
}

/**
@function replaceStringParams

@description
The method receives a variable matched from a regex /\${(.{0,99}?)}/g which should be replaced with a request params string.

Table and column names cannot be provided a values to be substituted in the database. To protect from SQL injections these variables may only contain whitelisted characters /^[A-Za-z0-9,"'._-\s]*$/.

Optional params such as [SQL] filter, and viewports may contain any character and will be replaced with an empty string if not provided in the req.params{}.

@param {req} req HTTP request.
@param {string} matched ${variable} to replace in template.
@property {object} req.params Request params.
@property {array} params.missing Missing params in req.params.
@property {set} params.optional Optional params for query template [eg filter, viewport].
@returns {string} The string to replace the matched variable with.
*/
function replaceStringParams(req, matched) {
  // Remove template brackets from matched param.
  const param = matched.replace(/\${|}/g, '');

  // Optional parameter should be replaced with empty string if not in request params.
  const change = req.params.optional.has(param)
    ? req.params[param] || ''
    : req.params[param];

  if (change === undefined) {
    req.params.missing.push(param);
    return;
  }

  if (req.params.optional.has(param)) {
    // Optional params eg filter and viewport may contain whitelisted characters.
    return change;
  }

  // Change value may only contain a limited set of whitelisted characters.
  if (!/^[A-Za-z0-9,"'._-\s]*$/.test(change)) {
    throw new Error(`Substitute \${${param}} value rejected: ${change}`);
  }

  return change;
}

/**
@function replaceValueParams

@description
The method receives a variable matched from a regex /%{(.{0,99}?)}/g which should be substituted in the database to protect from SQL injections.

Optional params such as [SQL] filter, and viewports may contain any character and will be replaced with an empty string if not provided in the req.params{}.

Variable substitution works with sequential placeholders. Values from the req.params or req.body will be added to the params.SQL[] array and replaced with a $n placeholder in the query_template string where n is the index of value in the params.SQL[] array.

@param {req} req HTTP request.
@param {string} matched %{variable} to be substituted in database.
@property {object} req.params Request params.
@property {array} params.SQL Array of values to be substituted in the database.
@property {array} params.missing Missing params in req.params.
@property {set} params.optional Optional params for query template [eg filter, viewport].
@returns {string} The string to replace the matched variable with.
*/
function replaceValueParams(req, matched) {
  // Remove template brackets from matched param.
  const param = matched.replace(/%{|}/g, '');

  let val = req.params.optional.has(param)
    ? req.params[param] || ''
    : req.params[param];

  if (param.startsWith('body.')) {
    val = req.params.body[param.replace('body.', '')];
  }

  if (val === undefined) {
    req.params.missing.push(param);
  }

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
}

/**
@function sendRows

@description
The method formats the rows returned from a SQL query and sends the formated rows through the HTTP response object.

@param {res} res HTTP response.
@param {object} template Request template.
@param {array} rows The response from a SQL query.
@property {boolean} [template.value_only] Return a single value from one row.
@property {boolean} [template.reduce] Reduce query response to a values array.
*/
function sendRows(res, template, rows) {
  if (rows instanceof Error) {
    res
      .status(500)
      .setHeader('Content-Type', 'text/plain')
      .send('Failed to query PostGIS table.');
    return;
  }

  // The rows array must have a length with some row not being empty.
  if (!rows?.length) {
    res
      .status(202)
      .setHeader('Content-Type', 'text/plain')
      .send('No rows returned from table.');
    return;
  }

  // Some row [object] must have a value which is not null.
  if (
    !rows.some(
      (row) =>
        typeof row === 'object' &&
        Object.values(row).some((val) => val !== null),
    )
  ) {
    res
      .status(202)
      .setHeader('Content-Type', 'text/plain')
      .send('No row returned any value.');
    return;
  }

  if (template.reduce) {
    // Reduce row values to an values array.
    res.send(rows.map((row) => Object.values(row)));
    return;
  }

  if (template.value_only) {
    const value = Object.values(rows[0])[0];

    // Numeric values may not be returned with the res.send() method.
    if (typeof value === 'number') {
      res.send(value.toString());
      return;
    }

    res.send(value);
    return;
  }

  // Send the infoj object with values back to the client.
  res.send((rows.length === 1 && rows[0]) || rows);
}
