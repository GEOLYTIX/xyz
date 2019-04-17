const env = require(global.__approot + '/mod/env');

module.exports = async (layer, table, id) => {

  var q = `
  DELETE FROM ${layer.mvt_cache} 
  WHERE
    ST_Intersects(
      tile, 
      (SELECT ${layer.geom_3857} FROM ${table} WHERE ${layer.qID} = $1)
    );`;

  await env.dbs[layer.dbs](q, [id]);

  return;

};