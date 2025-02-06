/**
### /workspace/templates/location_delete

The location_delete layer query removes a record from a layer table where the layer qID matches the provided id property.

@module /workspace/templates/location_delete
*/
export default (_) => {
  return `DELETE FROM ${_.table} WHERE ${_.layer.qID} = %{id};`;
};
