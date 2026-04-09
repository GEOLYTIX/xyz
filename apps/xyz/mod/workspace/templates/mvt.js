/**
### /workspace/templates/mvt

The mvt layer query template returns a vector tile (st_asmvt) with mvt geometries and their associated field properties.

@module /workspace/templates/mvt
*/
export default (_) => {
  const fields = [];

  _.fieldsMap &&
    Array.from(_.fieldsMap.entries()).forEach((entry) => {
      const [key, value] = entry;

      fields.push(`(${value}) as ${key}`);
    });

  const x = parseInt(_.x),
    y = parseInt(_.y),
    z = parseInt(_.z);

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
        ${(_.layer.z_field && `${_.layer.z_field} < ${z} AND`) || ''}
        ST_Intersects(
          ST_TileEnvelope(${z},${x},${y}),
          ${_.geom}
        )
        \${filter}
  ) tile`;
};
