/**
### /workspace/templates/get_last_location

The get_last_location layer query template returns the last id from layer table in a descending order.

@module /workspace/templates/get_last_location
*/
export default (_) => {
  const table =
    _.layer.table || Object.values(_.layer.tables).find((tab) => !!tab);

  const geom =
    _.layer.geom || Object.values(_.layer.geoms).find((tab) => !!tab);

  return `
    SELECT
    ${_.layer.qID} as id
    FROM ${table}
    WHERE ${geom} IS NOT NULL AND ${_.layer.qID} IS NOT NULL \${filter}
    ORDER BY ${_.layer.qID} DESC
    LIMIT 1`;
};
