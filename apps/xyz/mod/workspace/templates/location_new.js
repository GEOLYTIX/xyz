/**
### /workspace/templates/location_new

The location_new layer query returns the serial id for a new location record inserted into the table property.

The keys of the POST body are the field names. A key may only contain letters, numbers and underscores.

The values of the POST body are substituted as query params. The params are assigned with a `body_` prefix, so a body key can't overwrite a param of the template, eg. the table.

@module /workspace/templates/location_new
*/

/**
Field names [body keys] must be SQL identifiers.
*/
const FIELD = /^[A-Za-z_][A-Za-z0-9_]*$/;

export default (_) => {
  // select array for insert statement
  const selects = [];

  const keys = Object.keys(_.body);

  // The location ID must not be altered.
  if (keys.some((key) => key === _.layer.qID || key === 'id')) {
    throw new Error(
      `Layer ${_.layer.key}: You cannot update the ${_.layer.qID} or ID field as it is a reserved parameter.`,
    );
  }

  // The field names are written into the SQL string.
  if (keys.some((key) => !FIELD.test(key))) {
    throw new Error(
      `Layer ${_.layer.key}: Invalid field name in the location_new request body.`,
    );
  }

  // keys array for insert statement
  const fields = keys.map((key) => {
    // The param for the value substitution.
    const param = `body_${key}`;

    if (key === _.layer.geom) {
      // push geometry scaffolding into selects array.
      selects.push(
        `ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON(%{${param}})), ${_.layer.srid})`,
      );

      // push geojson string into params.
      _[param] = JSON.stringify(_.body[key]);

      return key;
    }

    // push %{param} into selects for substitution in query template.
    selects.push(`%{${param}}`);

    // push value into params.
    _[param] = _.body[key];

    return key;
  });

  return `
    INSERT INTO ${_.table} (${fields.join(',')})
    SELECT ${selects.join(',')}
    RETURNING ${_.layer.qID}::varchar AS id;`;
};
