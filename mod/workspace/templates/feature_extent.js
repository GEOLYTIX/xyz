export default (_) => {
  if (!_.body || !Array.isArray(_.body.ids)) {
    throw new Error('Invalid or missing body.ids - must be an array');
  }

  // Check potential SQL Injection.
  const ids = _.body.ids.filter((id) => /^[A-Za-z0-9,"'._-\s]*$/.test(id));

  return `
  SELECT
    ARRAY[st_xmin(box.box2d), st_ymin(box.box2d), st_xmax(box.box2d), st_ymax(box.box2d)] as box2d,
  FROM (
    SELECT
      Box2D(ST_Transform(ST_SetSRID(ST_Extent(${_.geom}),${_.srid}), ${_.proj}))
    FROM ${_.table}
    WHERE \${qID} IN ('${ids.join("','")}') \${filter}
  ) box`;
};
