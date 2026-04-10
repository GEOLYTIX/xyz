/**
### /workspace/templates/location_update

The location_update layer query updates a record in the layer table identified where layer qID matches the provided id property.

@module /workspace/templates/location_update
*/
export default (_) => {
  // The location ID must not be altered.
  if (Object.keys(_.body).some((key) => key === _.layer.qID || key === 'id')) {
    throw new Error(
      `Layer ${_.layer}: You cannot update the ${_.layer.qID} or ID field as it is a reserved parameter.`,
    );
  }

  const fields = Object.keys(_.body).map((key) => {
    // Value is null
    if (_.body[key] === null) {
      return `${key} = null`;
    }

    // Value is string. Escape quotes.
    if (typeof _.body[key] === 'string') {
      _[key] = _.body[key].replace(/'/gi, `''`);
    }

    // Value is geometry.
    if (_.body[key].coordinates) {
      return `${key} = ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON('${JSON.stringify(_.body[key])}')),${_.layer.srid})`;
    }

    // Value is an object and must be stringified.
    if (typeof _.body[key] === 'object' && !Array.isArray(_.body[key])) {
      _[key] = JSON.stringify(_.body[key]);
      if (_.body[key]['jsonb']) {
        const jsonb = _.body[key]['jsonb'];

        const jsonb_field = Object.keys(jsonb)[0];

        const updateObject = [];
        Object.keys(jsonb[jsonb_field]).forEach((key) => {
          let value =
            typeof jsonb[jsonb_field][key] === 'string'
              ? `"${jsonb[jsonb_field][key]}"`
              : jsonb[jsonb_field][key];

          if (Array.isArray(jsonb[jsonb_field][key])) {
            value = JSON.stringify(jsonb[jsonb_field][key]);
          }
          updateObject.push(`"${key}":${value}`);
        });

        return `${jsonb_field} = coalesce(${jsonb_field}::jsonb,'{}'::jsonb)::jsonb || '{${updateObject.join(',')}}'::jsonb`;
      }
    }

    // Value is array, boolean, or number.
    if (
      Array.isArray(_.body[key]) ||
      typeof _.body[key] === 'boolean' ||
      typeof _.body[key] === 'number'
    ) {
      _[key] = _.body[key];
    }

    return `${key} = %{${key}}`;
  });

  return `
    UPDATE ${_.table}
    SET ${fields.join()}
    WHERE ${_.layer.qID} = %{id};`;
};
