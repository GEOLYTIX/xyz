/**
### /workspace/templates/wkt

The wkt layer query template returns feature records from a layer table as an ordered array.

@module /workspace/templates/wkt
*/
module.exports = _ => {

  // Get fields array from query params.
  const fields = _.fields?.split(',')
    .map(field => `${_.workspace.templates[field]?.template || field} AS ${field}`)
    .filter(field => !!field)
    || []

  // Unshift the geom field into the array.
  if (_.geom && !_.no_geom) {

    fields.unshift(`ST_AsText(${_.geom}) AS geometry`)
  }

  // Push label (cluster) into fields
  _.label && fields.push(`${_.workspace.templates[_.label]?.template || _.label} AS ${_.label}`)

  const where = _.viewport || `AND ${_.geom} IS NOT NULL`

  return `
    SELECT
      \${qID} AS id
      ${fields.length && `, ${fields.join(', ')}` || ''}
      FROM \${table}
      WHERE TRUE ${where} \${filter};`
}