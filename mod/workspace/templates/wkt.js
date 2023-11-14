module.exports = _ => {

    // Get fields array from query params.
    const fields = _.fields?.split(',')
        .map(field => _.workspace.templates[field]?.template || field)
        .filter(field => !!field)

    // Push label (cluster) into fields
    _.label && fields.push(_.workspace.templates[_.label]?.template || _.label)

    const where = _.viewport || `AND ${_.geom || _.layer.geom} IS NOT NULL`

    return `
        SELECT
        \${qID} AS id,
        ST_AsText(${_.geom || _.layer.geom}) AS geometry
        ${fields && `, ${fields.join(', ')}` || ''}
        FROM \${table}
        WHERE TRUE ${where} \${filter};`
}