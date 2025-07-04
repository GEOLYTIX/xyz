export default (_) => {

  let condition = 'true'

  if (Array.isArray(_.body?.ids)) {
    const ids = _.body.ids.filter((id) => /^[A-Za-z0-9,"'._-\s]*$/.test(id));

    condition = `\${qID} IN ('${ids.join("','")}')`
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
      WHERE ${condition} \${filter}) box`
};
