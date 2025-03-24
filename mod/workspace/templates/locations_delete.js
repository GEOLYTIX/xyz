/**
### /workspace/templates/locations_delete

The locations_delete layer query deletes multiple records in a layer table which pass the provided viewport and/or SQL filter.

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
