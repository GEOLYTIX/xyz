module.exports = _ => {

    const layer = _.workspace.locales[_.locale].layers[_.layer]

    // Get fields array from query params.
    const fields = _.fields?.split(',')
        .map(field => `${_.workspace.templates[field]?.template || field} as ${field}`)

    console.log(fields)

    const aggFields = _.fields?.split(',')
        .map(field => `(array_agg(${field}))[1] as ${field}`)

    console.log(aggFields)

    const where = _.viewport || `AND ${_.geom || layer.geom} IS NOT NULL`

      // Calculate grid resolution (r) based on zoom level and resolution parameter.
    const r = parseInt(40075016.68 / Math.pow(2, _.z) * _.resolution);

    // ${params.cat && `${params.aggregate || 'array_agg'}(cat) cat,` || ''}

    return `
    SELECT
      ARRAY[x_round, y_round],
      count(1),
      (array_agg(id))[1] AS id
      ${_.label ? `,(array_agg(label))[1] AS label` : ''}
      ${_.fields ? ',' + aggFields.join() : ''}

    FROM (
      SELECT
        ${layer.qID || null} as id,
        ${_.label || null} as label,
        ${_.fields ? fields.join() + ',' : ''}
        round(ST_X(${_.geom || layer.geom}) / ${r}) * ${r} x_round,
        round(ST_Y(${_.geom || layer.geom}) / ${r}) * ${r} y_round
      FROM ${_.table}
      WHERE TRUE ${where} \${filter}) grid

    GROUP BY x_round, y_round;`

}