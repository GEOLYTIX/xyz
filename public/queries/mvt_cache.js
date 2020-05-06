module.exports = {
  access: 'admin_workspace',
  render: _ => `
  
  DROP table if exists ${_.layer.mvt_cache};

  Create UNLOGGED table ${_.layer.mvt_cache}
  (
    z integer not null,
    x integer not null,
    y integer not null,
    mvt bytea,
    tile geometry(Polygon, ${_.layer.srid}),
    constraint ${_.layer.mvt_cache.replace(/\./, '_')}_z_x_y_pk
      primary key (z, x, y)
  );

  Create index IF NOT EXISTS ${_.layer.mvt_cache.replace(/\./, '_')}_tile on ${_.layer.mvt_cache} (tile);

  SELECT '${_.layer.mvt_cache} cache OK' as msg;`
}