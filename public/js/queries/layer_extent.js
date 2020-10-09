module.exports = {
  render: _ => `
  
  SELECT
    Box2D(
      ST_Transform(
        ST_SetSRID(
          ST_Extent(${_.geom || _.layer.geom}),
          ${_.geom_srid || _.layer.srid}),
        ${_.srid || 3857}))
  FROM ${_.table || _.layer.table || Object.values(_.layer.tables)[0] || Object.values(_.layer.tables)[1]}
  WHERE true ${_.filter};`
}