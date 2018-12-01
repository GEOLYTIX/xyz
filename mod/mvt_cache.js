module.exports = async (layer, table, id) => {

  var q = `
  DELETE FROM ${table}__mvts 
  WHERE
    ST_Intersects(
      tile, 
      (SELECT ${layer.geom_3857} FROM ${table} WHERE ${layer.qID} = $1)
    );`;

  await global.pg.dbs[layer.dbs](q, [id]);

  return;

};