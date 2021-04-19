module.exports = {
  admin: true,
  render: _ => {

    const layer = _.workspace.locales[_.locale].layers[_.layer]
  
    return `
    
    DROP table if exists ${layer.mvt_cache};

    Create UNLOGGED table ${layer.mvt_cache}
    (
      z integer not null,
      x integer not null,
      y integer not null,
      mvt bytea,
      tile geometry(Polygon, ${layer.srid}),
      constraint ${layer.mvt_cache.replace(/\./, '_')}_z_x_y_pk
        primary key (z, x, y)
    );

    Create index IF NOT EXISTS ${layer.mvt_cache.replace(/\./, '_')}_tile on ${layer.mvt_cache} (tile);

    SELECT '${layer.mvt_cache} cache OK' as msg;`
  }
}