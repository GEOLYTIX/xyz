/**
### /workspace/templates/location_delete

The location_delete layer query removes a record from a layer table where the layer qID matches the provided id property.

The layer filter is applied to the query. The qID identifies the record, but the layer.filter.default decides whether the layer may access the record. The layer list and tile queries only show the records which pass the default filter, and the request can not alter it. Location ids are serial and can be enumerated. Without the filter a request with an id could delete a record which the layer does not show. See the location_get template.

A location which does not pass the layer.filter.default is not deleted. The query does not fail, the record remains in the table.

The location_delete template is authorized by the authorizeDelete method of the _locationAccess module.

@module /workspace/templates/location_delete
*/
export default (_) => {
  return `DELETE FROM ${_.table} WHERE ${_.layer.qID} = %{id} \${filter};`;
};
