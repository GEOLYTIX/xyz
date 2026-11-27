/**
### /workspace/templates/locations_delete

The locations_delete layer query deletes multiple records in a layer table which pass the provided viewport and/or SQL filter.

The template is authorized like location_delete. The layer requires deleteLocation.

The layer filter is applied like in the location_delete template. Only records which pass the layer.filter.default and the request filter are deleted. A record which the layer does not show is never deleted.

@module /workspace/templates/locations_delete
*/
export default (_) => {
  // If no layer parameter, return
  if (!_.layer) {
    throw new Error(
      `You cannot delete locations data without providing the layer parameter.`,
    );
  }

  return `
    DELETE FROM ${_.table || _.layer.table}
    WHERE TRUE ${_.viewport || ''} \${filter};`;
};
