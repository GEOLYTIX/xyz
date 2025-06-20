export default (_) => {
  // Check potential SQL Injection.
  const ids = _.body.ids.filter((id) => /^[A-Za-z0-9,"'._-\s]*$/.test(id));

  return `
  SELECT 
    Box2D(ST_Transform(ST_SetSRID(ST_Extent(${_.geom}),${_.srid}), ${_.proj}))
  FROM ${_.table}
  WHERE \${qID} IN ('${ids.join("','")}') \${filter}`;
};
