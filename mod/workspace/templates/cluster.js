/**
### /workspace/templates/cluster

The cluster layer query template returns aggregated cluster features.

@module /workspace/templates/cluster
*/
module.exports = _ => {

  _.qID ??= _.layer.qID || null
  _.geom ??= _.layer.geom

  // Get fields array from query params.
  const fields = _.fieldsMap?.entries().map(entry => {
    return `${entry[0]} as ${entry[1]}`
  })

  const aggFields = _.fields?.split(',')
    .map(field => `CASE WHEN count(*)::int = 1 THEN (array_agg(${field}))[1] END as ${field}`)

  const where = _.viewport || `AND ${_.geom} IS NOT NULL` 

  // Calculate grid resolution (r) based on zoom level and resolution parameter.
  const r = parseInt(40075016.68 / Math.pow(2, _.z) * _.resolution);

  return `
    SELECT
      ARRAY[x_round, y_round],
      count(*)::int,
      CASE
        WHEN count(*)::int = 1 THEN (array_agg(id))[1]::varchar
        ELSE CONCAT('!',(array_agg(id))[1]::varchar)
        END AS id
      
      ${_.fields ? ',' + aggFields.join() : ''}

    FROM (
      SELECT
        ${_.qID} as id,
        ${_.fields ? fields.join() + ',' : ''}
        round(ST_X(${_.geom}) / ${r}) * ${r} x_round,
        round(ST_Y(${_.geom}) / ${r}) * ${r} y_round
      FROM ${_.table}
      WHERE TRUE ${where} \${filter}) grid

    GROUP BY x_round, y_round;`
}
