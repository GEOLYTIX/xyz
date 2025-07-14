/**
### /workspace/templates/layer_extent

The layer extent query method returns a bounding box that describes the extent of a range of geometries. 

a body with ids can be supplied optionally to limit the geometries considered. 

@module /workspace/templates/layer_extent
*/
export default (_) => {
  let condition = 'true';

  //use ids where supplied
  if (Array.isArray(_.body?.ids)) {
    //Remove ids with invalid characters
    const ids = _.body.ids.filter((id) => /^[A-Za-z0-9,"'._-\s]*$/.test(id));

    condition = `\${qID} IN ('${ids.join("','")}')`;
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
