/**
## /workspace/integrity

The integrity module checks whether the queries for every layer in a composed workspace can be executed on their dbs connection.

Layer data queries [mvt, wkt, geojson, cluster] are rendered for every table and every theme of a layer and sent to the database as EXPLAIN statements. EXPLAIN will plan but not execute the query, which validates the SQL, tables, columns, and types without reading or writing data.

The location_get query of a layer with an infoj is sent to the database as an EXPLAIN statement.

No data is read or written by the integrity check.

Queries are rendered by the buildQuery method of the query module to apply the same validation as a query request.

The result has the start, end, and duration of the integrity check, and of each failed layer check.

Locales and layers which failed to compose are added as errors. An error is added if the locale or layer param does not match a locale or layer in the workspace.

@requires /query
@requires /utils/dbs
@requires /workspace/getLayer
@requires /workspace/getLocale

@module /workspace/integrity
*/

import { buildQuery } from '../query.js';
import dbs_connections from '../utils/dbs.js';
import getLayer from './getLayer.js';
import getLocale from './getLocale.js';

// The number of layers which are checked at the same time.
const CONCURRENCY = 5;

// Layer formats which request features from a query template.
const QUERY_FORMATS = new Set(['cluster', 'geojson', 'mvt', 'vector', 'wkt']);

/**
@function integrity
@async

@description
The integrity method checks the layers of all locales in a composed workspace.

Layers which are inherited by nested locales are only checked once.

The locale and layer params can be provided to restrict the check to a locale and/or layer.

@param {Object} workspace A composed workspace with locales and layers.
@param {Object} params Request params.
@property {string|Array} [params.locale] Only check layers in this locale.
@property {string} [params.layer] Only check this layer.
@property {Object} params.user The admin user requesting the check.
@returns {Promise<Object>} The timing, checked and failed count, failed layers, and errors.
*/
export default async function integrity(workspace, params) {
  const start = new Date();

  const result = {
    start: start.toISOString(),
    end: undefined,
    duration_ms: undefined,
    checked: 0,
    failed: 0,
    failed_layers: [],
    errors: [],
  };

  const localeKey = Array.isArray(params.locale)
    ? params.locale.join(',')
    : params.locale;

  // The user may access all layers and templates for the check.
  const user = { email: params.user?.email, admin: true, roles: true };

  const { checks, locales, localeKeys } = collectChecks(
    workspace,
    { locale: localeKey, layer: params.layer, user },
    result,
  );

  const dropped = await droppedLayers(locales, params.layer, user);

  const tasks = checks.map((check, i) => () => runLayer(check, result, i));

  await runTasks(tasks, CONCURRENCY);

  for (const { failed, error } of dropped) {
    result.failed_layers.push(failed);
    result.errors.push(error);
  }

  if (localeKey && !localeKeys.includes(localeKey)) {
    result.errors.push({
      locale: localeKey,
      error: `Locale not found. Locale keys: ${localeKeys.join(' | ')}`,
    });
  } else if (params.layer && !checks.length && !dropped.length) {
    result.errors.push({
      locale: localeKey,
      layer: params.layer,
      error: 'Layer not found in the locale layers.',
    });
  }

  const end = new Date();

  result.end = end.toISOString();
  result.duration_ms = end - start;

  result.checked = checks.length + dropped.length;

  // Remove the empty slots of passed layers from the failed_layers array.
  result.failed_layers = result.failed_layers.filter(Boolean);

  result.failed = result.failed_layers.length;

  return result;
}

/**
@function collectChecks

@description
The collectChecks method collects the layer checks for the locales in the composed workspace which match the locale param.

A layer which matches the layer param is collected once. Nested locales inherit layers which only need to be checked once.

Locales which failed to compose are added as errors to the integrity result.

@param {Object} workspace A composed workspace with locales and layers.
@param {Object} params The check params.
@property {string} [params.locale] The locale key.
@property {string} [params.layer] Only check this layer.
@property {Object} params.user The user for the checks.
@param {Object} result The integrity result.
@returns {Object} The checks array, the [locale, key] entries of the checked locales, and the locale keys in the workspace.
*/
function collectChecks(workspace, params, result) {
  const checked = new Set();

  const checks = [];

  const locales = [];

  const localeKeys = [];

  for (const [entryKey, locale] of Object.entries(workspace.locales)) {
    if (!locale) continue;

    const key =
      locale instanceof Error
        ? entryKey
        : (locale.keys?.join(',') ?? locale.key);

    localeKeys.push(key);

    if (params.locale && params.locale !== key) continue;

    if (locale instanceof Error) {
      result.errors.push({ locale: key, error: locale.message });
      continue;
    }

    locales.push([locale, key]);

    addChecks(locale, key, params, checked, checks);
  }

  return { checks, locales, localeKeys };
}

/**
@function addChecks

@description
Adds a check for every layer of the locale which matches the layer param to the checks array. A layer is not added if the same layer has been added before.

@param {Object} locale A composed locale with a layers array.
@param {string} key The locale key.
@param {Object} params The check params.
@property {string} [params.layer] Only check this layer.
@property {Object} params.user The user for the checks.
@param {Set} checked Set of stringified layers which have been added.
@param {Array} checks The array of layer checks.
*/
function addChecks(locale, key, params, checked, checks) {
  // The composed locale.layers is an array of JSON layers.
  for (const layer of locale.layers ?? []) {
    if (params.layer && params.layer !== layer.key) continue;

    const layerString = JSON.stringify(layer);

    if (checked.has(layerString)) continue;

    checked.add(layerString);

    checks.push({ locale: key, layer, user: params.user });
  }
}

/**
@function droppedLayers
@async

@description
The droppedLayers method finds the layers of the checked locales which failed to compose.

The locales are checked concurrently. A layer which is dropped from a locale and its nested locales with the same error is only returned once for the first locale.

@param {Array} locales The [locale, key] entries of the checked locales.
@param {string} [layerKey] Only check this layer.
@param {Object} user The user for the getLocale and getLayer methods.
@returns {Promise<Array>} The failed layer and error for each dropped layer.
*/
async function droppedLayers(locales, layerKey, user) {
  const localeDropped = await Promise.all(
    locales.map(([locale, key]) =>
      localeDroppedLayers(locale, key, layerKey, user),
    ),
  );

  const dropped = new Map();

  for (const droppedLayer of localeDropped.flat()) {
    const droppedKey = `${droppedLayer.error.layer} ${droppedLayer.error.error}`;

    if (!dropped.has(droppedKey)) dropped.set(droppedKey, droppedLayer);
  }

  return Array.from(dropped.values());
}

/**
@function localeDroppedLayers
@async

@description
The localeDroppedLayers method finds the layers of a locale which failed to compose.

The getLocale method removes layers from the composed locale.layers array if the getLayer method returns an error. The layer keys of the locale without composed layers are compared with the composed layers. The getLayer error is returned for each missing layer.

The getLocale method shifts the first key from a locale keys array param. A copy of the locale keys must be provided for each request.

@param {Object} locale A composed locale with a layers array.
@param {string} key The locale key.
@param {string} [layerKey] Only check this layer.
@param {Object} user The user for the getLocale and getLayer methods.
@returns {Promise<Array>} The failed layer and error for each dropped layer.
*/
async function localeDroppedLayers(locale, key, layerKey, user) {
  const start = new Date();

  const localeParam = () => (locale.keys ? [...locale.keys] : key);

  const rawLocale = await getLocale({ locale: localeParam(), user });

  if (rawLocale instanceof Error || !rawLocale.layers) return [];

  const composed = new Set((locale.layers ?? []).map((layer) => layer.key));

  const missing = Object.keys(rawLocale.layers).filter(
    (layer) => !composed.has(layer) && (!layerKey || layerKey === layer),
  );

  const layers = await Promise.all(
    missing.map((layer) => getLayer({ locale: localeParam(), layer, user })),
  );

  const end = new Date();

  return missing.flatMap((layer, i) =>
    layers[i] instanceof Error
      ? [
          {
            failed: {
              locale: key,
              layer,
              start: start.toISOString(),
              end: end.toISOString(),
              duration_ms: end - start,
            },
            error: {
              locale: key,
              layer,
              template: 'getLayer',
              error: layers[i].message,
            },
          },
        ]
      : [],
  );
}

/**
@function runLayer
@async

@description
The runLayer method runs the checkLayer method for a layer.

The errors of the layer check are added to the integrity result. A layer with errors is added with the start, end, and duration of the layer check to the failed_layers array.

An unexpected exception in a layer check is added as an error to not stop the check of other layers.

@param {Object} check The locale key, layer, and user for the check.
@param {Object} result The integrity result.
@param {number} index The index of the layer check.
*/
async function runLayer(check, result, index) {
  const start = new Date();

  const layerResult = { errors: [] };

  try {
    await checkLayer(check, layerResult);
  } catch (err) {
    layerResult.errors.push({ ...entry(check), error: err.message });
  }

  if (!layerResult.errors.length) return;

  const end = new Date();

  result.errors.push(...layerResult.errors);

  // Failed layers are assigned by index since layers are checked concurrently.
  result.failed_layers[index] = {
    locale: check.locale,
    layer: check.layer.key,
    start: start.toISOString(),
    end: end.toISOString(),
    duration_ms: end - start,
  };
}

/**
@function checkLayer
@async

@description
The checkLayer method checks the layer tables for layers with a query format.

The location check is run for layers with an infoj on the first layer table. Layers without a table can not get a location from the location_get query.

The queries of a layer are sent one at a time to limit the number of concurrent queries to the number of layers which are checked at the same time.

@param {Object} check The locale key, layer, and user for the check.
@param {Object} result The layer result with an errors array.
*/
async function checkLayer(check, result) {
  const { layer } = check;

  const tables = layerTables(layer);

  const tasks = QUERY_FORMATS.has(layer.format)
    ? tables.flatMap(([z, table]) => tableTasks(check, result, z, table))
    : [];

  if (layer.infoj && layer.qID && tables.length) {
    tasks.push(() => checkLocation(check, result, tables[0][1]));
  }

  await runTasks(tasks, 1);
}

/**
@function tableTasks

@description
The tableTasks method returns a task for every theme field set of the table. A task sends an EXPLAIN query for the layer format template with the fields.

Themes which require the same fields are only checked once.

@param {Object} check The locale key, layer, and user for the check.
@param {Object} result The layer result with an errors array.
@param {string} [z] The zoom level key for the table.
@param {string} table The layer table.
@returns {Array<Function>} Async task functions.
*/
function tableTasks(check, result, z, table) {
  const { layer } = check;

  const fieldSets = new Map();

  for (const [themeKey, theme] of layerThemes(layer)) {
    const fields = fieldsArray(layer, theme).join(',');

    if (!fieldSets.has(fields)) fieldSets.set(fields, []);

    if (themeKey) fieldSets.get(fields).push(themeKey);
  }

  return Array.from(fieldSets, ([fields, themes]) => async () => {
    const err = await explainQuery(check, layerParams(layer, z, table, fields));

    if (err) {
      result.errors.push({
        ...entry(check, layerTemplate(layer)),
        table,
        themes: themes.length ? themes : undefined,
        duration_ms: err.duration_ms,
        error: err.message,
      });
    }
  });
}

/**
@function checkLocation
@async

@description
The checkLocation method sends an EXPLAIN query for the location_get template of the layer.

The infoj fields, fieldfx, and field templates are validated without reading a location from the layer table.

@param {Object} check The locale key, layer, and user for the check.
@param {Object} result The layer result with an errors array.
@param {string} table The layer table.
*/
async function checkLocation(check, result, table) {
  // A NULL id can be bound to any qID type for a query which is not executed.
  const err = await explainQuery(check, {
    template: 'location_get',
    table,
    id: null,
  });

  if (err) {
    result.errors.push({
      ...entry(check, 'location_get'),
      duration_ms: err.duration_ms,
      error: err.message,
    });
  }
}

/**
@function explainQuery
@async

@description
The explainQuery method renders a query with the buildQuery method and sends the query as an EXPLAIN statement to the dbs connection.

The layer is cloned for the request params since query templates may assign properties to the layer.

EXPLAIN only applies to the first statement of a query. A query with multiple statements is not sent to the database since any further statement would be executed. 

@param {Object} check The locale key, layer, and user for the check.
@param {Object} params The query params.
@returns {Promise<Error|undefined>} An error with the duration_ms of the query if the query can not be rendered or planned.
*/
async function explainQuery(check, params) {
  const start = Date.now();

  const req = {
    params: {
      ...params,
      layer: structuredClone(check.layer),
      locale: check.locale,
      user: check.user,
    },
  };

  const built = await buildQuery(req);

  if (built instanceof Error) return built;

  if (statementCount(built.query) > 1) {
    return new Error(
      'The query has multiple statements and can not be checked with EXPLAIN.',
    );
  }

  const rows = await dbs_connections[built.template.dbs]({
    query: `EXPLAIN ${built.query}`,
    timeout: built.template.statement_timeout,
    variables: req.params.SQL,
  });

  if (rows instanceof Error) {
    rows.duration_ms = Date.now() - start;
    return rows;
  }
}

/**
@function statementCount

@description
Returns the number of SQL statements in a query string.

Quoted strings, quoted identifiers, dollar quoted strings, and comments are removed before the query is split at semicolons. Empty statements, eg. after a trailing semicolon, are not counted.

@param {string} query SQL query string.
@returns {number} The number of statements.
*/
export function statementCount(query) {
  const unquoted = query.replace(
    /'(?:[^']|'')*'|"(?:[^"]|"")*"|\$(\w*)\$[\s\S]*?\$\1\$|--[^\n]*|\/\*[\s\S]*?\*\//g,
    ' ',
  );

  return unquoted.split(';').filter((statement) => statement.trim()).length;
}

/**
@function layerTables

@description
Returns an array of [zoom, table] entries for every table and geom combination which the layer can request.

The table and geom are looked up for every zoom level up to one level above the highest key of the layer.tables and layer.geoms objects, with the same lookup as the tableCurrent and geomCurrent methods of a mapp layer. Higher zoom levels have the same table and geom as the highest key.

A table and geom combination is only returned for the first zoom level.

@param {Object} layer A JSON layer.
@returns {Array} Array of [zoom, table] entries.
*/
function layerTables(layer) {
  const zoomKeys = [layer.tables, layer.geoms].flatMap((obj) =>
    Object.keys(obj ?? {}).map(Number),
  );

  const maxZoom = zoomKeys.length ? Math.max(...zoomKeys) + 1 : 0;

  const tableGeoms = new Map();

  for (let zoom = 0; zoom <= maxZoom; zoom++) {
    const table = layer.table || zoomValue(layer.tables, zoom);

    if (!table) continue;

    const tableGeom = `${table} ${layerGeom(layer, zoom)}`;

    if (!tableGeoms.has(tableGeom)) tableGeoms.set(tableGeom, [zoom, table]);
  }

  return Array.from(tableGeoms.values());
}

/**
@function zoomValue

@description
Returns the value for the zoom level from an object with zoom level keys, eg. layer.tables or layer.geoms.

The value of the first or last key will be returned if the zoom level is outside the range of the object keys. A zoom level within the range which is not a key has no value.

@param {Object} [obj] Object with zoom level keys.
@param {number} zoom The zoom level.
@returns {*} The value for the zoom level.
*/
function zoomValue(obj, zoom) {
  if (!obj) return;

  const zoomKeys = Object.keys(obj).map(Number);

  const min = Math.min(...zoomKeys);
  const max = Math.max(...zoomKeys);

  if (zoom < min) return obj[min];
  if (zoom > max) return obj[max];

  return obj[zoom];
}

/**
@function layerThemes

@description
Returns an array of [key, theme] entries for the layer.style.themes object.

The layer.style.theme is returned if the layer has no themes object. A layer without themes returns a single entry without theme.

@param {Object} layer A JSON layer.
@returns {Array} Array of [key, theme] entries.
*/
function layerThemes(layer) {
  const themes = Object.entries(layer.style?.themes ?? {}).filter(
    ([, theme]) => typeof theme === 'object',
  );

  if (themes.length) return themes;

  if (typeof layer.style?.theme === 'object') {
    return [[layer.style.theme.title, layer.style.theme]];
  }

  return [[undefined, undefined]];
}

/**
@function fieldsArray

@description
Returns an array of feature fields which are requested for the layer with the theme.

The method must match the fieldsArray method of the mapp featureFields module which assigns the layer.params.fields for layer data requests.

@param {Object} layer A JSON layer.
@param {Object} [theme] The layer theme.
@returns {Array} Array of feature fields.
*/
export function fieldsArray(layer, theme) {
  const fieldsSet = new Set([
    layer.params?.default_fields,
    theme?.field,
    layer.style?.label?.field,
    layer.style?.hover?.field,
    layer.style?.icon_scaling?.field,
    layer.cluster?.label,
  ]);

  if (Array.isArray(theme?.fields)) {
    theme.fields.forEach(fieldsSet.add, fieldsSet);
  }

  return Array.from(fieldsSet)
    .flat()
    .filter((field) => !!field);
}

/**
@function layerTemplate

@description
Returns the query template key for the layer format.

The layer.params.template takes precedence. Cluster layers with a resolution use the cluster or cluster_hex template.

@param {Object} layer A JSON layer.
@returns {string} The query template key.
*/
function layerTemplate(layer) {
  if (layer.params?.template) return layer.params.template;

  if (layer.cluster?.resolution) {
    return layer.cluster.hexgrid ? 'cluster_hex' : 'cluster';
  }

  return layer.format;
}

/**
@function layerParams

@description
Returns the query params for a layer data request at the zoom level of the table.

The tile, viewport, and resolution params are placeholder values since the query is not executed.

@param {Object} layer A JSON layer.
@param {string} [z] The zoom level key for the table.
@param {string} table The layer table.
@param {string} fields Comma separated feature fields.
@returns {Object} The query params.
*/
function layerParams(layer, z, table, fields) {
  const zoom = Number.parseInt(z) || 0;

  const params = {
    ...layer.params,
    template: layerTemplate(layer),
    table,
    geom: layerGeom(layer, zoom),
    srid: layer.srid,
    x: '0',
    y: '0',
    z: String(zoom),
  };

  delete params.fields;

  if (fields) params.fields = fields;

  // The viewport and z params are flags in the layer params.
  if (layer.params?.viewport || layer.cluster?.resolution) {
    params.viewport = `-1,-1,1,1,${layer.srid || 4326}`;
  } else {
    delete params.viewport;
  }

  if (layer.cluster?.resolution) {
    params.resolution = String(layer.cluster.resolution);
  }

  return params;
}

/**
@function layerGeom

@description
Returns the geom for the zoom level from the layer.geoms object.

The layer.geom is returned if the layer has no geom for the zoom level. The query module assigns the layer.geom if the geom param is not provided.

@param {Object} layer A JSON layer.
@param {number} zoom The zoom level.
@returns {string} The layer geom.
*/
function layerGeom(layer, zoom) {
  return zoomValue(layer.geoms, zoom) ?? layer.geom;
}

/**
@function entry

@description
Returns the locale, layer, and template properties for an error entry.

@param {Object} check The locale key and layer for the check.
@param {string} template The query template key.
@returns {Object} Entry properties.
*/
function entry(check, template) {
  return { locale: check.locale, layer: check.layer.key, template };
}

/**
@function runTasks
@async

@description
Runs async task functions with a limited number of tasks at the same time.

Each worker runs the next task from the queue once its current task is complete.

@param {Array<Function>} tasks Async task functions.
@param {number} limit The number of tasks to run at the same time.
*/
async function runTasks(tasks, limit) {
  const queue = [...tasks];

  async function worker() {
    const task = queue.shift();

    if (!task) return;

    await task();

    return worker();
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, worker),
  );
}
