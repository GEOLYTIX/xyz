const { Pool } = require('pg');

const dbs = {};

module.exports = () => {

  Object.keys(process.env)
    .filter(key => key.split('_')[0] === 'DBS')
    .filter(key => !dbs[key.split('_')[1]])
    .forEach(key => {

      // Create connection pool.
      const pool = new Pool({
        connectionString: process.env[key],
        statement_timeout: parseInt(process.env.STATEMENT_TIMEOUT) || 10000
      });

      dbs[key.split('_')[1]] = async (q, arr, timeout) => {

        // Request which accepts q and arr and will return rows or rows.err.
        try {
          timeout && await pool.query(`SET statement_timeout = ${timeout}`);

          const { rows } = await pool.query(q, arr);

          timeout && await pool.query(`SET statement_timeout = 10000`);

          return rows;

        } catch (err) {
          console.error(err);
          return err;
        }

      };

    });

  return dbs;

};