export default (_) => {

  return `
  SELECT 
    Box2D(ST_Transform(ST_SetSRID(ST_Extent(${_.geom}),${_.srid}), ${_.proj}))
  FROM ${_.table}
  WHERE \${qID} IN ('${_.body.ids.join("','")}') \${filter}`;
};
