module.exports = _ => {

    const layer = _.workspace.locales[_.locale].layers[_.layer]

    const properties = Array.isArray(layer.properties) ?
        `, json_build_object(${layer.properties.map(field=>`'${field}',${_.workspace.templates[field]?.template || field}`).join(', ')}) as properties`
        :''; 
   
    return `
        SELECT
        'Feature' AS type,
        \${qID} AS id,
        ST_asGeoJson(\${geom})::json AS geometry
        ${properties}
        FROM \${table}
        WHERE \${geom} IS NOT NULL \${filter};`
  }