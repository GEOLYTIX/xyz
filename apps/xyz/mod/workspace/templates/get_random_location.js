/**
### /workspace/templates/get_random_location

The get_random_location layer query template returns a single feature from the specified layer that meets the criteria. 
The criteria include the presence of a geometry and a unique identifier (ID) for the feature.
The filter will also be applied to the query if provided.

@module /workspace/templates/get_random_location
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
    LIMIT 1`;
};
