export default (_) => {
  const ids = _.body.ids;

  return `select Box2D(ST_Transform(ST_SetSRID(ST_Extent(${_.geom}),${_.srid}), ${_.proj}))
                   from ${_.table}
                   where true ${_.filter} 
                   and ${_.qid} in (${ids.join(',')})`;
};
