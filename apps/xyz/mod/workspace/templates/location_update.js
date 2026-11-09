/**
### /workspace/templates/location_update

The location_update layer query updates a record in the layer table identified where layer qID matches the provided id property.

The keys of the POST body are the field names. A key may only contain letters, numbers and underscores.

The values of the POST body are substituted as query params. A value is never written into the SQL string. The params are assigned with a `body_` prefix, so a body key can't overwrite a param of the template, eg. the table.

@module /workspace/templates/location_update
*/

/**
Field names [body keys] must be SQL identifiers.
*/
const FIELD = /^[A-Za-z_][A-Za-z0-9_]*$/;

export default (_) => {
  const keys = Object.keys(_.body);

  // The location ID must not be altered.
  if (keys.some((key) => key === _.layer.qID || key === 'id')) {
    throw new Error(
      `Layer ${_.layer.key}: You cannot update the ${_.layer.qID} or ID field as it is a reserved parameter.`,
    );
  }

  const fields = keys.map((key) => {
    const value = _.body[key];

    // The param for the value substitution.
    const param = `body_${key}`;

    checkField(key, _.layer);

    // Value is null
    if (value === null) {
      return `${key} = null`;
    }

    // Value is geometry.
    if (value.coordinates) {
      _[param] = JSON.stringify(value);
      return `${key} = ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON(%{${param}})),${_.layer.srid})`;
    }

    // The jsonb object is merged into a jsonb field. The key is the infoj entry field.
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      value.jsonb instanceof Object
    ) {
      const jsonb_field = Object.keys(value.jsonb)[0];

      checkField(jsonb_field, _.layer);

      _[param] = JSON.stringify(value.jsonb[jsonb_field]);

      return `${jsonb_field} = coalesce(${jsonb_field}::jsonb,'{}'::jsonb) || %{${param}}::jsonb`;
    }

    // Value is an object and must be stringified.
    if (typeof value === 'object' && !Array.isArray(value)) {
      _[param] = JSON.stringify(value);
      return `${key} = %{${param}}`;
    }

    // Value is a string, array, boolean, or number.
    _[param] = value;

    return `${key} = %{${param}}`;
  });

  return `
    UPDATE ${_.table}
    SET ${fields.join()}
    WHERE ${_.layer.qID} = %{id};`;
};

/**
@function checkField

@description
Throws an error if the field name is not an SQL identifier. The field name is written into the SQL string.

@param {string} field The field name from the POST body.
@param {Object} layer The layer of the query.
*/
function checkField(field, layer) {
  if (!FIELD.test(field)) {
    throw new Error(
      `Layer ${layer.key}: Invalid field name in the location_update request body.`,
    );
  }
}
