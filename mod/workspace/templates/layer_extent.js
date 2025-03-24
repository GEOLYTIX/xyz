/**
### /workspace/templates/layer_extent

The layer_extent layer query returns the bbox coordinates of feature [record] geometries which which pass the provided layer filter.

@module /workspace/templates/layer_extent
*/
export default `
  SELECT
    Box2D(
      ST_Transform(
        ST_SetSRID(
          ST_Extent(\${geom}),
          \${proj}),
        \${srid}))
  FROM \${table}
  WHERE true \${filter};`;
