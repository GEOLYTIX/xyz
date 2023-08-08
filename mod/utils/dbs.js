const { Pool } = require('pg');

const logger = require('./logger');

const dbs = {};

module.exports = () => {

  Object.keys(process.env)

    // Filter keys which start with DBS 
    .filter(key => key.split('_')[0] === 'DBS')

    // Filter keys which are not yet assigned to dbs object.
    .filter(key => !dbs[key.split('_')[1]])

    .forEach(key => {

      const pool = new Pool({
        connectionString: process.env[key],
        statement_timeout: parseInt(process.env.STATEMENT_TIMEOUT) || 10000
      });
  
      dbs[key.split('_')[1]] = async (q, arr, timeout) => {
  
        // Request which accepts q and arr and will return rows or rows.err.
        try {

          const client = await pool.connect()
          
          timeout && await client.query(`SET statement_timeout = ${parseInt(timeout)}`)
  
          const { rows } = await client.query(q, arr)
  
          timeout && await client.query(`SET statement_timeout = 10000`)

          client.release()
  
          return rows
  
        } catch (err) {
          const msg = `  
            ---  
            ${err}
            
            attempted query: ${q}
            
            params: ${arr}

            timeout: ${timeout}
            ---
          `;

          console.error(msg);
          logger(msg);

          throw new Error(err);
        }
  
      }

    })

  return dbs
};