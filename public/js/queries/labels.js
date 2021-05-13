module.exports = {
  render: _ => {

    const layer = _.workspace.locales[_.locale].layers[_.layer]
    
    return `
      SELECT
        \${label} AS label,
        ST_X(ST_PointOnSurface(${layer.geom})) AS x,
        ST_Y(ST_PointOnSurface(${layer.geom})) AS y
      FROM \${table}
      WHERE
        ST_Intersects(
          ST_MakeEnvelope(
            %{west},
            %{south},
            %{east},
            %{north},
            ${layer.srid}
          ),
          ${layer.geom}
        )
      \${filter};`
  }
}