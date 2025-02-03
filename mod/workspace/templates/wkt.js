/**
### /workspace/templates/wkt

The wkt layer query template returns feature records from a layer table as an ordered array.

@module /workspace/templates/wkt
*/
export default (_) => {
  const fields = [];

  _.fieldsMap &&
    Array.from(_.fieldsMap.entries()).forEach((entry) => {
      const [key, value] = entry;

      fields.push(`(${value}) as ${key}`);
    });

  // Unshift the geom field into the array.
  if (_.geom && !_.no_geom) {
    fields.unshift(`ST_AsText(${_.geom}) AS geometry`);
  }

  const where = _.viewport || `AND ${_.geom} IS NOT NULL`;

  return `
    SELECT
      \${qID} AS id
      ${(fields.length && `, ${fields.join(', ')}`) || ''}
      FROM \${table}
      WHERE TRUE ${where} \${filter};`;
};
