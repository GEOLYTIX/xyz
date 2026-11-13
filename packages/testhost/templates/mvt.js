/**
### testhost mvt query template

The devdb PostGIS is compiled without protobuf-c and can't create vector tiles with ST_AsMVT. The testhost replaces the core mvt query template with this template through the CUSTOM_TEMPLATES.

The template has the layer, fields and filter of the core mvt template. It returns the feature geometries as GeoJSON in the tile pixel coordinates instead of a vector tile. The testhost mvtEncode middleware encodes the rows as vector tile.

The geometries are clipped to the tile envelope with a buffer, snapped to the tile pixel grid, and the exterior rings of polygons have a positive area in the tile coordinates with the y axis pointing down, as required by the vector tile specification.

The template is imported as a module from a data URL and must not import other modules.

@module testhost/templates/mvt
*/
export default (_) => {
  const fields = [];

  _.fieldsMap &&
    Array.from(_.fieldsMap.entries()).forEach((entry) => {
      const [key, value] = entry;

      fields.push(`(${value}) as ${key}`);
    });

  const x = Number.parseInt(_.x),
    y = Number.parseInt(_.y),
    z = Number.parseInt(_.z);

  // The tile extent and the clip buffer in tile pixels.
  const extent = 4096;
  const buffer = 256;

  // The scale from EPSG:3857 metres to tile pixels.
  const scale = `(${extent} / (ST_XMax(tile.env) - ST_XMin(tile.env)))`;

  return `
    SELECT * FROM (
      SELECT
        ${_.layer.qID || null} as id,
        ${fields.length ? fields.toString() + ',' : ''}
        ST_AsGeoJSON(ST_ForcePolygonCCW(ST_RemoveRepeatedPoints(ST_SnapToGrid(
          ST_Affine(
            ST_Intersection(
              ${_.geom},
              ST_Expand(tile.env, ${buffer} / ${scale})
            ),
            ${scale}, 0, 0, -${scale},
            -ST_XMin(tile.env) * ${scale}, ST_YMax(tile.env) * ${scale}
          ),
        1))))::json AS mvt_geometry
      FROM ${_.table}, (SELECT ST_TileEnvelope(${z},${x},${y}) env) tile
      WHERE
        ${(_.layer.z_field && `${_.layer.z_field} < ${z} AND`) || ''}
        ST_Intersects(tile.env, ${_.geom})
        \${filter}
    ) features
    WHERE mvt_geometry IS NOT NULL`;
};
