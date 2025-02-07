/**
### /workspace/templates/geojson

The geojson layer query template returns an array of records including a geojson geometry.

@module /workspace/templates/geojson
*/
export default (_) => {
  const fields = [];

  _.fieldsMap &&
    Array.from(_.fieldsMap.entries()).forEach((entry) => {
      const [key, value] = entry;

      fields.push(`'${key}', ${value}`);
    });

  const properties = fields.length
    ? `, json_build_object(${fields.join(', ')}) as properties`
    : '';

  const where = _.viewport || `AND ${_.geom || _.layer.geom} IS NOT NULL`;

  return `
    SELECT
    'Feature' AS type,
    \${qID} AS id,
    ST_asGeoJson(${_.geom || _.layer.geom})::json AS geometry
    ${properties}
    FROM \${table}
    WHERE TRUE ${where} \${filter};`;
};
