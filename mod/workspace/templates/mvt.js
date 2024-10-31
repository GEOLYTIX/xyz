module.exports = _ => {

  // Get fields array from query params.
  const fields = _.fields?.split(',')
    .map(field => `${_.workspace.templates[field]?.template || field} AS ${field}`)
    .filter(field => !!field)
    || []

  // Push label (cluster) into fields
  _.label && fields.push(`${_.workspace.templates[_.label]?.template || _.label} AS ${_.label}`)

  const
    x = parseInt(_.x),
    y = parseInt(_.y),
    z = parseInt(_.z)

  return `
    SELECT
      ST_AsMVT(tile, '${_.layer.key}', 4096, 'geom') mvt
    FROM (
      SELECT
        ${_.layer.qID || null} as id,
        ${fields.length ? fields.toString() + ',' : ''}
        ST_AsMVTGeom(
          ${_.geom},
          ST_TileEnvelope(${z},${x},${y}),
          4096,
          1024,
          false
        ) geom
      FROM ${_.table}
      WHERE
        ${_.layer.z_field && `${_.layer.z_field} < ${z} AND` || ''}
        ST_Intersects(
          ST_TileEnvelope(${z},${x},${y}),
          ${_.geom}
        )
        \${filter}
  ) tile`
}