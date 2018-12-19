// Create DBS connection pools for PostGIS.
module.exports = async () => {

  global.pg.dbs = {};

  console.log(' ');
  console.log('---------Checking DBS---------');
  
  // Iterate through environment variables to find DBS_* entries.
  await Object.keys(process.env).forEach(async key => {

    if (key.split('_')[0] === 'DBS') {
    
      // Create connection pool.
      const pool = new require('pg').Pool({
        connectionString: process.env[key],
        statement_timeout: 10000
      });
    
      // Request which accepts q and arr and will return rows or rows.err.
      global.pg.dbs[key.split('_')[1]] = async (q, arr, no_log) => {
    
        try {
          const { rows } = await pool.query(q, arr);
          return rows;
    
        } catch (err) {
          Object.keys(err).forEach(key => !err[key] && delete err[key]);
          if (!no_log) console.error(err);
          return { err: err };
        }
    
      };

      const PostGIS = await global.pg.dbs[key.split('_')[1]]('SELECT postgis_version();');

      if (PostGIS.err) {
        console.log(`${key}: Can't detect PostGIS.`);
        delete global.pg.dbs[key.split('_')[1]];
      }

      if (PostGIS.length === 1) console.log(`${key}: ${PostGIS[0].postgis_version}`);

    }

  });

};