/**
### /workspace/templates/location_count

The location_count layer query returns the count of table records which pass the provided layer filter and viewport.

@module /workspace/templates/location_count
*/
module.exports = `
  SELECT count(*) as location_count
  FROM \${table}
  WHERE true \${filter} \${viewport}`;
