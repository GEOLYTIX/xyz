module.exports = _ => {

    const layer = _.workspace.locales[_.locale].layers[_.layer]

    let propertiesString = '';
    
    if (Array.isArray(layer.properties)) {
        const propertyKeyValuePairs = layer.properties.map(field => {
            const value = _.workspace.templates[field]?.template || field;
            return `'${field}',${value}`;
        });
        propertiesString = ', json_build_object(' + propertyKeyValuePairs.join(', ') + ') as properties';
    }

    const properties = propertiesString;

    return `
        SELECT
        'Feature' AS type,
        \${qID} AS id,
        ST_asGeoJson(\${geom})::json AS geometry
        ${properties}
        FROM \${table}
        WHERE \${geom} IS NOT NULL \${filter};`
}