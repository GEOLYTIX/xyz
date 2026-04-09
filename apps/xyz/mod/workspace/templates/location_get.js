/**
### /workspace/templates/location_get

The location_get layer query returns the field values from a location record in the layer table where the location qID matches the provided id param.

@module /workspace/templates/location_get
*/
export default (_) => {
  // The SQL array may be populated by a default filter which is not required for this query template.
  _.SQL = [];

  // The layer.qID will be returned from the select statement.
  const fields = [_.layer.qID];

  _.infojMap &&
    Array.from(_.infojMap.entries()).forEach((entry) => {
      const [key, value] = entry;

      fields.push(`(${value}) as ${key}`);
    });

  return `
    SELECT ${fields.join()}
    FROM ${_.table}
    WHERE ${_.layer.qID} = %{id}`;
};
