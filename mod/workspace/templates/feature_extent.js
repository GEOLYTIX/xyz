export default (_) => {
  const ids = _.body.ids;

  return `
  SELECT 
    Box2D(ST_Transform(ST_SetSRID(ST_Extent(${_.geom}),${_.srid}), ${_.proj}))
  FROM ${_.table}
  WHERE true \${filter} and \${qID} in (${ids.join(',')})`;
};
