const env = require('./env');

async function writeLog(layer, id) {

  // Create duplicate of item in log table.
  var q = `
      INSERT INTO ${layer.log.table} 
      SELECT *
      FROM ${layer.table} WHERE ${layer.qID || 'id'} = $1;`;
  
  var rows = await env.dbs[layer.dbs](q, [id]);
  
  if (rows.err) return res.code(500).send('Failed to query PostGIS table.');
}