/**
## /workspace/templates/_locationAccess

The locationAccess module exports the authorize methods for the location write query templates. The query module calls the `authorize` method of a template with the request params before the template is rendered.

Location writes are permitted by the layer configuration. The layer has been composed for the requesting user by the getLayer method. Configuration which is nested in a `roles` object is only present for a user with that role. A workspace can therefore grant write access to some roles only, eg. an infoj entry with `"roles": { "editor": { "edit": true } }`.

| Template | Permitted by |
|---|---|
| location_new | `layer.draw` |
| location_update | infoj entries with `edit` |
| location_delete, locations_delete | `layer.deleteLocation` or `layer.edit.delete` |
| sql_table_insert | a `csv_upload`, `csvupload` or `sqlinsert` config for the table |

The table param of a location write must be the layer table or one of the layer tables.

A deployment can set the `LOCATION_WRITES=legacy` xyzEnv to permit writes which are not authorized by the layer config. The query module then logs a warning for each such write instead of sending a 403. The legacy mode restores the behaviour before v5.1.0 for plugins and runtime config which write fields without a layer config.

The legacy mode does not apply to json fields which are only editable through json_key entries. The location_update template merges only the editable keys into such a field and drops the other keys without a warning. See the jsonMergeKeys method of the location_update template.

@requires /workspace/templates/location_update

@module /workspace/templates/_locationAccess
*/

import { jsonMergeKeys, updateValue } from './location_update.js';

/**
@function writeTables

@description
Returns the set of tables a location write may target. These are the layer.table and the string values of the layer.tables object.

@param {Object} layer The composed layer.
@returns {Set<string>} The writable tables.
*/
function writeTables(layer) {
  const tables = new Set();

  if (typeof layer.table === 'string') tables.add(layer.table);

  if (layer.tables instanceof Object) {
    for (const table of Object.values(layer.tables)) {
      typeof table === 'string' && tables.add(table);
    }
  }

  return tables;
}

/**
@function checkTable

@description
Returns an Error if the table param is not a writable table of the layer.

@param {Object} params The request params.
@returns {Error|undefined}
*/
function checkTable(params) {
  if (!writeTables(params.layer).has(params.table)) {
    return new Error(
      `${params.template} on ${params.layer.key} layer requires a layer table param.`,
    );
  }
}

/**
@function editEntries

@description
Returns the infoj entries with an `edit` config. Entries with a query are not fields of the layer table.

@param {Object} layer The composed layer.
@returns {Array<Object>} The editable entries.
*/
function editEntries(layer) {
  if (!Array.isArray(layer.infoj)) return [];

  return layer.infoj.filter(
    (entry) =>
      entry instanceof Object &&
      !!entry.edit &&
      !entry.query &&
      typeof entry.field === 'string',
  );
}

/**
@function editFields

@description
Returns the fields of the layer table which may be written with a plain value.

- The field of an editable entry.
- The json_field of an editable entry with a json_key. The mapp location update sends the json field as a whole object. The location_update template only merges the editable json_key values, see the jsonMergeKeys method of the location_update template. The field of the json_key entry is not a table field.

The field of an editable jsonb_field entry is not a table field. The jsonb value is checked by the jsonbEntry method.

@param {Object} layer The composed layer.
@returns {Set<string>} The editable fields.
*/
export function editFields(layer) {
  const fields = new Set();

  for (const entry of editEntries(layer)) {
    if (entry.jsonb_field) continue;

    if (entry.json_field && entry.json_key) {
      typeof entry.json_field === 'string' && fields.add(entry.json_field);
      continue;
    }

    fields.add(entry.field);
  }

  return fields;
}

/**
@function isOnlyKey

@description
Returns true if the key is a string and the only key of the object.

@param {Object} obj The object to check.
@param {string} key The expected key.
@returns {boolean}
*/
function isOnlyKey(obj, key) {
  if (typeof key !== 'string' || !(obj instanceof Object)) return false;

  const keys = Object.keys(obj);

  return keys.length === 1 && keys[0] === key;
}

/**
@function jsonbPermitted

@description
Returns true if the body key and value match an editable jsonb entry. The mapp location update sends `{ [entry.field]: { jsonb: { [jsonb_field]: { [jsonb_key]: newValue } } } }`.

@param {Object} layer The composed layer.
@param {string} key The request body key.
@param {Object} value The request body value.
@returns {boolean}
*/
function jsonbPermitted(layer, key, value) {
  return editEntries(layer).some(
    (entry) =>
      entry.field === key &&
      isOnlyKey(value.jsonb, entry.jsonb_field) &&
      isOnlyKey(value.jsonb[entry.jsonb_field], entry.jsonb_key),
  );
}

/**
@function drawDefaults

@description
Parses the layer.draw config for `defaults` and `default_fields` objects. The mapp createLocation method spreads these into the location_new request body.

The value of a `defaults` key is fixed by the config. The value of a `default_fields` key is looked up from the draw interaction and can not be checked.

@param {Object} draw The layer.draw config.
@returns {{defaults: Map<string, Array>, fields: Set<string>}} The configured default values by key, and the default_fields keys.
*/
function drawDefaults(draw) {
  const result = { defaults: new Map(), fields: new Set() };

  parseDraw(draw, result);

  return result;
}

/**
@function parseDraw

@description
Recursively assigns the `defaults` values and the `default_fields` keys of a draw config object to the result of the drawDefaults method.

@param {Object} obj A draw config object.
@param {Object} result The drawDefaults result.
*/
function parseDraw(obj, result) {
  if (!(obj instanceof Object)) return;

  for (const [key, value] of Object.entries(obj)) {
    const isPlainObject = value instanceof Object && !Array.isArray(value);

    if (key === 'default_fields' && isPlainObject) {
      Object.keys(value).forEach((field) => result.fields.add(field));
      continue;
    }

    if (key === 'defaults' && isPlainObject) {
      for (const [field, fieldValue] of Object.entries(value)) {
        const values = result.defaults.get(field) ?? [];
        values.push(JSON.stringify(fieldValue));
        result.defaults.set(field, values);
      }
      continue;
    }

    parseDraw(value, result);
  }
}

/**
@function checkBodyObject

@description
Returns an Error if the request body is not a JSON object.

@param {Object} params The request params.
@returns {Error|undefined}
*/
function checkBodyObject(params) {
  if (!(params.body instanceof Object) || Array.isArray(params.body)) {
    return new Error(`${params.template} requires a JSON object body.`);
  }
}

/**
@function denied

@param {Object} params The request params.
@param {Array<string>} keys The body keys which are not permitted.
@returns {Error}
*/
function denied(params, keys) {
  return new Error(
    `${params.template} on ${params.layer.key} layer: field(s) not editable: ${keys.join(', ')}`,
  );
}

/**
@function authorizeNew

@description
A location may only be created on a layer with a draw config. Each key of the request body must be:

- The layer geom.
- An editable field of the layer, or the jsonb_field of an editable jsonb entry. A new record has no jsonb keys which could be overwritten.
- A `default_fields` key of the layer.draw config.
- A `defaults` key of the layer.draw config, with a value configured for that key.

@param {Object} params The request params.
@returns {Error|undefined} An Error if the location_new request is not permitted.
*/
export function authorizeNew(params) {
  if (!params.layer.draw) {
    return new Error(
      `location_new is not permitted on ${params.layer.key} layer without a draw config.`,
    );
  }

  const tableError = checkTable(params) || checkBodyObject(params);
  if (tableError) return tableError;

  const fields = editFields(params.layer);

  for (const entry of editEntries(params.layer)) {
    typeof entry.jsonb_field === 'string' && fields.add(entry.jsonb_field);
  }

  if (typeof params.layer.geom === 'string') fields.add(params.layer.geom);

  const draw = drawDefaults(params.layer.draw);

  const keys = Object.keys(params.body).filter((key) => {
    if (fields.has(key) || draw.fields.has(key)) return false;

    return !draw.defaults.get(key)?.includes(JSON.stringify(params.body[key]));
  });

  if (keys.length) return denied(params, keys);
}

/**
@function authorizeUpdate

@description
Each key of the request body must be an editable field of the layer with a plain value, or the field of an editable jsonb entry with a jsonb value for the jsonb_field and jsonb_key of the entry.

A value is classified by the updateValue method of the location_update template, which decides how the template writes the value. A value with coordinates is written as a geometry into the field of the body key, even if the value also has a jsonb property. The value is therefore checked as a geometry for an editable field, not as a jsonb value.

@param {Object} params The request params.
@returns {Error|undefined} An Error if the location_update request is not permitted.
*/
export function authorizeUpdate(params) {
  if (!editEntries(params.layer).length) {
    return new Error(
      `location_update is not permitted on ${params.layer.key} layer without editable entries.`,
    );
  }

  const tableError = checkTable(params) || checkBodyObject(params);
  if (tableError) return tableError;

  const fields = editFields(params.layer);

  const jsonMerge = jsonMergeKeys(params.layer);

  const keys = Object.entries(params.body)
    .filter(([key, value]) => {
      const type = updateValue(value);

      // The location_update template merges a jsonb value into the jsonb field named in the value. A jsonb value is only permitted for a jsonb entry.
      if (type === 'jsonb') return !jsonbPermitted(params.layer, key, value);

      // The template merges only the json_key values of a json field which is only editable through json_key entries. The field can not be replaced with another value type.
      if (jsonMerge.has(key)) return type !== 'json';

      return !fields.has(key);
    })
    .map(([key]) => key);

  if (keys.length) return denied(params, keys);
}

/**
@function insertConfigs

@description
Returns the csv_upload, csvupload and sqlinsert config objects in the layer. The mapp csvUpload method and the jsonDataview sqlinsert toolbar send these configs with the sql_table_insert template.

@param {Object} obj The composed layer or a nested object.
@param {Array<Object>} [configs=[]] The configs found.
@returns {Array<Object>} The insert configs.
*/
function insertConfigs(obj, configs = []) {
  if (!(obj instanceof Object)) return configs;

  for (const [key, value] of Object.entries(obj)) {
    if (
      ['csv_upload', 'csvupload', 'sqlinsert'].includes(key) &&
      value instanceof Object &&
      !Array.isArray(value)
    ) {
      configs.push(value);
      continue;
    }

    insertConfigs(value, configs);
  }

  return configs;
}

/**
@function authorizeInsert

@description
The sql_table_insert template inserts the POST body arrays into the table param. The table must be the table of a csv_upload, csvupload or sqlinsert config in the layer, as `table` or `queryparams.table`. If the config has a `fields` object, the field of each `field::cast` body key must be a key of the fields object.

@param {Object} params The request params.
@returns {Error|undefined} An Error if the sql_table_insert request is not permitted.
*/
export function authorizeInsert(params) {
  const bodyError = checkBodyObject(params);
  if (bodyError) return bodyError;

  const configs = insertConfigs(params.layer).filter(
    (config) =>
      params.table &&
      (config.table === params.table ||
        config.queryparams?.table === params.table),
  );

  if (!configs.length) {
    return new Error(
      `sql_table_insert on ${params.layer.key} layer requires an insert config for the ${params.table} table.`,
    );
  }

  const fields = Object.keys(params.body).map((key) => key.split('::')[0]);

  const permitted = configs.some(
    (config) =>
      !(config.fields instanceof Object) ||
      fields.every((field) => Object.hasOwn(config.fields, field)),
  );

  if (!permitted) {
    return denied(params, fields);
  }
}

/**
@function authorizeDelete

@description
A location may only be deleted on a layer with deleteLocation or the legacy edit.delete flag. The authorizeDelete method also authorizes the locations_delete template, which deletes the locations passing the layer filter and viewport.

@param {Object} params The request params.
@returns {Error|undefined} An Error if the location_delete request is not permitted.
*/
export function authorizeDelete(params) {
  if (!params.layer.deleteLocation && !params.layer.edit?.delete) {
    return new Error(
      `${params.template} is not permitted on ${params.layer.key} layer without deleteLocation.`,
    );
  }

  // The locations_delete template deletes from the layer.table without a table param.
  if (params.template === 'locations_delete' && !params.table) return;

  return checkTable(params);
}
