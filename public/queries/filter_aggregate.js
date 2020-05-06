module.exports = {
  render: _ => {

    const fields = _.layer.filter.infoj.map(entry => `(${entry.fieldfx || entry.field}) AS ${entry.field}`)
    
    const geom_extent = `ST_Transform(ST_SetSRID(ST_Extent(${_.layer.geom}), ${_.layer.srid}), 4326)`

    return `
    SELECT
    ST_asGeoJson(
      ST_Transform(
        ST_SetSRID(
          ST_Buffer(
            ST_Transform(
              ST_SetSRID(${geom_extent},4326),
            3857),
            ST_Distance(
              ST_Transform(
                ST_SetSRID(
                  ST_Point(
                    ST_XMin(ST_Envelope(${geom_extent})),
                    ST_YMin(ST_Envelope(${geom_extent}))
                  ),
                4326),
              3857),
            ST_Transform(
              ST_SetSRID(
                ST_Point(
                  ST_XMax(ST_Envelope(${geom_extent})),
                  ST_Ymin(ST_Envelope(${geom_extent}))
                ),
              4326),
            3857)
          ) * 0.1
        ),
      3857),
    ${_.layer.srid})) AS geometry,
    ${fields.join(',')}
    FROM ${_.table}
    WHERE true ${_.filter};`
  }
}