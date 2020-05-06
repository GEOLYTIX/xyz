module.exports = {
  render: _ => `
  
  SELECT
    ${_.label} AS label,
    ST_X(ST_PointOnSurface(${_.layer.geom})) AS x,
    ST_Y(ST_PointOnSurface(${_.layer.geom})) AS y
  FROM ${_.table}
  WHERE
    ST_DWithin(
      ST_MakeEnvelope(${_.west}, ${_.south}, ${_.east}, ${_.north}, ${_.layer.srid}),
      ${_.layer.geom}, 0.00001)
    ${_.filter};`
}