/**
### /workspace/templates/layer_extent

The layer extent query method returns a bounding box that describes the extent of a range of geometries.

A body with ids can be supplied optionally to limit the geometries considered. The ids are substituted as a query param, not written into the SQL string.

@module /workspace/templates/layer_extent
*/
export default (_) => {
  let condition = 'true';

  // Use ids where supplied.
  if (Array.isArray(_.body?.ids)) {
    // The ids are passed as a query param and compared as varchar, so the id values are never part of the SQL string.
    _.body_ids = _.body.ids.map((id) => String(id));

    condition = `\${qID}::varchar = ANY(%{body_ids})`;
  }

  return `
    SELECT
      ARRAY[
        st_xmin(box.box2d),
        st_ymin(box.box2d),
        st_xmax(box.box2d),
        st_ymax(box.box2d)]
    FROM(
      SELECT Box2D(
        ST_Transform(
          ST_SetSRID(
            ST_Extent(\${geom}),
            \${proj}),
          \${srid}))
      FROM \${table}
      WHERE ${condition} \${filter}) box`;
};
