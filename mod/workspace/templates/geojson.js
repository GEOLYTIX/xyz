/**
### /workspace/templates/geojson

The geojson layer query template returns an array of records including a geojson geometry.

@module /workspace/templates/geojson
*/
module.exports = _ => {

  let properties = '';

  if (_.fieldsMap) {
    const propertyKeyValuePairs = _.fieldsMap?.entries().map(entry => {
    
    //_.fields?.split(',').map(field => {
      //const value = _.workspace.templates[field]?.template || field;
      return `'${entry[0]}',${entry[1]}`;
    });
    properties = ', json_build_object(' + propertyKeyValuePairs.join(', ') + ') as properties';
  }

  const where = _.viewport || `AND ${_.geom || _.layer.geom} IS NOT NULL`

  return `
    SELECT
    'Feature' AS type,
    \${qID} AS id,
    ST_asGeoJson(${_.geom || _.layer.geom})::json AS geometry
    ${properties}
    FROM \${table}
    WHERE TRUE ${where} \${filter};`
}
