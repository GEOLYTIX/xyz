module.exports = _ => {

    let properties = '';

    if (_.fields) {
        const propertyKeyValuePairs = _.fields?.split(',').map(field => {
            const value = _.workspace.templates[field]?.template || field;
            return `'${field}',${value}`;
        });
        properties = ', json_build_object(' + propertyKeyValuePairs.join(', ') + ') as properties';
    }

    return `
        SELECT
        'Feature' AS type,
        \${qID} AS id,
        ST_asGeoJson(\${geom})::json AS geometry
        ${properties}
        FROM \${table}
        WHERE \${geom} IS NOT NULL \${filter};`
}