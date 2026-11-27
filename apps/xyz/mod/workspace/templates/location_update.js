/**
### /workspace/templates/location_update

The location_update layer query updates a record in the layer table identified where layer qID matches the provided id property.

The layer filter is applied to the query. The qID identifies the record, but the layer.filter.default decides whether the layer may access the record. The layer list and tile queries only show the records which pass the default filter, and the request can not alter it. Location ids are serial and can be enumerated. Without the filter a request with an id could update a record which the layer does not show, eg. a record of another role's layer on the same table. See the location_get template.

A location which does not pass the layer.filter.default is not updated. The query does not fail, the record remains unchanged. An update which changes a field of the default filter may move the location outside the filter. The location can then no longer be updated or deleted through this layer.

The body keys are authorized by the authorizeUpdate method of the _locationAccess module before the template is rendered.

The keys of the POST body are the field names. A key may only contain letters, numbers and underscores.

The values of the POST body are substituted as query params. A value is never written into the SQL string. The params are assigned with a `body_` prefix, so a body key can't overwrite a param of the template, eg. the table.

@module /workspace/templates/location_update
*/

/**
Field names [body keys] must be SQL identifiers.
*/
const FIELD = /^[A-Za-z_]\w*$/;

export default (_) => {
  const keys = Object.keys(_.body);

  // The location ID must not be altered. Unquoted identifiers are case-insensitive in Postgres.
  if (keys.some((key) => isReserved(key, _.layer))) {
    throw new Error(
      `Layer ${_.layer.key}: You cannot update the ${_.layer.qID} or ID field as it is a reserved parameter.`,
    );
  }

  const jsonMerge = jsonMergeKeys(_.layer);

  const fields = keys.map((key) => {
    const value = _.body[key];

    // The param for the value substitution.
    const param = `body_${key}`;

    checkField(key, _.layer);

    // The authorizeUpdate method of the _locationAccess module checks the value by the same type.
    switch (updateValue(value)) {
      case 'null':
        return `${key} = null`;

      case 'geometry':
        _[param] = JSON.stringify(value);
        return `${key} = ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON(%{${param}})),${_.layer.srid})`;

      case 'jsonb': {
        // The jsonb object is merged into a jsonb field. The key is the infoj entry field.
        const jsonb_field = Object.keys(value.jsonb)[0];

        checkField(jsonb_field, _.layer);

        _[param] = JSON.stringify(value.jsonb[jsonb_field]);

        return `${jsonb_field} = coalesce(${jsonb_field}::jsonb,'{}'::jsonb) || %{${param}}::jsonb`;
      }

      case 'json': {
        const mergeKeys = jsonMerge.get(key);

        if (mergeKeys) {
          // The json field is only editable through json_key entries. Only the editable keys are merged into the field. The mapp location update sends the whole object with the current values of the other keys.
          const merge = Object.fromEntries(
            Object.entries(value).filter(([jsonKey]) => mergeKeys.has(jsonKey)),
          );

          _[param] = JSON.stringify(merge);

          return `${key} = coalesce(${key}::jsonb,'{}'::jsonb) || %{${param}}::jsonb`;
        }

        // Value is an object and must be stringified.
        _[param] = JSON.stringify(value);
        return `${key} = %{${param}}`;
      }

      default:
        // Value is a string, array, boolean, or number.
        _[param] = value;
        return `${key} = %{${param}}`;
    }
  });

  return `
    UPDATE ${_.table}
    SET ${fields.join()}
    WHERE ${_.layer.qID} = %{id} \${filter};`;
};

/**
@function updateValue

@description
Returns how the location_update template writes a request body value. The template and the authorizeUpdate method of the _locationAccess module must classify a value by this method, so that a value is authorized as the type it is written as.

- `null` sets the field to null.
- `geometry` is a value with coordinates, which is written as a geometry into the field. A geometry with a jsonb property is a geometry.
- `jsonb` is an object with a jsonb object, which is merged into the jsonb field named in the jsonb object.
- `json` is any other object, which is written as a JSON string.
- `value` is a string, array, boolean, or number.

@param {*} value A request body value.
@returns {string} The value type: null, geometry, jsonb, json, or value.
*/
export function updateValue(value) {
  if (value === null) return 'null';

  if (value.coordinates) return 'geometry';

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value.jsonb instanceof Object ? 'jsonb' : 'json';
  }

  return 'value';
}

/**
@function jsonMergeKeys

@description
Returns the json fields which are only editable through json_key entries, with the editable json_key of each field.

An infoj entry with a json_field and json_key edits a single key of a json field. The mapp location update sends the whole json field object, with the current values of the other keys. The location_update template merges only the editable keys of such a json field. The other keys of the field can not be written.

A json field which has an editable entry of its own, eg. `{ "field": "meta", "edit": true }`, is replaced as a whole and is not returned.

A key which is not editable is dropped from the request value without an error or a warning, also with the `LOCATION_WRITES=legacy` xyzEnv. The legacy mode only applies to requests which are denied by an authorize method, and the merge is not a denial. A warning can not tell a changed key from an unchanged key, because the mapp location update sends every key of the field. A plugin which writes a key of a json field requires an infoj entry with the json_field, the json_key, and `edit` for that key.

The authorizeUpdate method of the _locationAccess module only permits an object value for a returned json field.

@param {Object} layer The composed layer.
@returns {Map<string, Set<string>>} The editable json keys by json field.
*/
export function jsonMergeKeys(layer) {
  const merge = new Map();

  if (!Array.isArray(layer?.infoj)) return merge;

  const editable = layer.infoj.filter(
    (entry) =>
      entry instanceof Object &&
      !!entry.edit &&
      !entry.query &&
      typeof entry.field === 'string',
  );

  for (const entry of editable) {
    if (entry.jsonb_field || !entry.json_field || !entry.json_key) continue;

    if (typeof entry.json_field !== 'string') continue;

    const keys = merge.get(entry.json_field) ?? new Set();
    keys.add(String(entry.json_key));
    merge.set(entry.json_field, keys);
  }

  // A json field with an editable entry of its own is replaced as a whole.
  for (const entry of editable) {
    if (entry.jsonb_field || (entry.json_field && entry.json_key)) continue;

    merge.delete(entry.field);
  }

  return merge;
}

/**
@function checkField

@description
Throws an error if the field name is not an SQL identifier. The field name is written into the SQL string.

@param {string} field The field name from the POST body.
@param {Object} layer The layer of the query.
*/
function checkField(field, layer) {
  // FIELD.test(undefined) would test the string 'undefined'.
  if (typeof field !== 'string' || !FIELD.test(field)) {
    throw new Error(
      `Layer ${layer.key}: Invalid field name in the location_update request body.`,
    );
  }
}

/**
@function isReserved

@description
Returns true if the field is the layer qID or the id field. Unquoted identifiers are case-insensitive in Postgres, so the comparison is case-insensitive.

@param {string} field The field name from the POST body.
@param {Object} layer The layer of the query.
@returns {boolean} The field is reserved.
*/
export function isReserved(field, layer) {
  const name = field.toLowerCase();
  return name === 'id' || name === String(layer.qID).toLowerCase();
}
