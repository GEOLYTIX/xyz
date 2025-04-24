/**
### /workspace/templates/location_field_value

The location_field_value query returns the value of a single field from a table where the location qID matches the provided id param.
*/
export default (_) => {
  return `
  SELECT \${field}
  FROM \${table}
  WHERE ${_.layer.qID} = %{id}`;
};
