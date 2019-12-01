const env = require('../env');

module.exports = async () => {

  // Iterate through environment variables to find DBS_* entries.
  await Object.keys(process.env).forEach(async key => {

    if (key.split('_')[0] !== 'DBS') return;

    // Create connection pool.
    const pool = new require('pg').Pool({
      connectionString: process.env[key],
      statement_timeout: 10000
    });

    const dbs = key.split('_')[1];

    // Request which accepts q and arr and will return rows or rows.err.
    env.dbs[dbs] = async (q, arr, no_log, no_timeout) => {

      try {
        no_timeout && await pool.query('SET statement_timeout = 0');
        
        const { rows } = await pool.query(q, arr);

        no_timeout && await pool.query('SET statement_timeout = 10000');

        return rows;

      } catch (err) {
        Object.keys(err).forEach(key => !err[key] && delete err[key]);
        if (!no_log) console.error(err);
        return { err: err };
      }

    };

    const PostGIS = await env.dbs[dbs]('SELECT postgis_version();');

    if (PostGIS.err) {
      console.log(`${key}: Can't detect PostGIS.`);
      delete env.dbs[dbs];
    }

  });

};