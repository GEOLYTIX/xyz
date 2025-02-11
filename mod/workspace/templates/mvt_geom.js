module.exports = (_) => {
  const x = parseInt(_.x),
    y = parseInt(_.y),
    z = parseInt(_.z);

  return `
    SELECT
      ST_AsMVT(tile, '${_.layer.key}', 4096, 'geom') mvt
    FROM (
      SELECT
        ${_.layer.qID || null} as id,
        ST_AsMVTGeom(
          ${_.geom},
          ST_TileEnvelope(${z},${x},${y}),
          4096,
          1024,
          false
        ) geom
      FROM ${_.table}
      WHERE
        ST_Intersects(
          ST_TileEnvelope(${z},${x},${y}),
          ${_.geom}
        )
      ) tile`;
};
