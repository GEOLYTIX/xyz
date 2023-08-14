module.exports = _ => {

    const layer = _.workspace.locales[_.locale].layers[_.layer]

    // Get fields array from query params.
    const fields = _.fields?.split(',')
        .map(field => _.workspace.templates[field]?.template || field)
        .filter(field => !!field)

    const where = _.viewport || `AND ${_.geom || layer.geom} IS NOT NULL`

    return `
        SELECT
        \${qID} AS id,
        ST_AsText(${_.geom || layer.geom}) AS geometry
        ${fields && `, ${fields.join(', ')}` || ''}
        FROM \${table}
        WHERE TRUE ${where} \${filter};`
}