const { Pool } = require('pg');

const logger = require('./logger');

const dbs = {};

Object.keys(process.env)

  // Filter keys which start with DBS 
  .filter(key => /^DBS_/.test(key))

  .forEach(key => {

    const pool = new Pool({
      connectionString: process.env[key],
      options: `-c statement_timeout=${parseInt(process.env.STATEMENT_TIMEOUT)||10000}`
    });

    dbs[key.split('_')[1]] = async (q, arr, timeout) => {

      try {

        const client = await pool.connect()

        timeout && await client.query(`SET statement_timeout = ${parseInt(timeout)}`)

        const { rows } = await client.query(q, arr)

        timeout && await client.query(`SET statement_timeout = ${parseInt(process.env.STATEMENT_TIMEOUT) || 10000}`)

        client.release()

        return rows

      } catch (err) {

        logger({ err, q, arr })
        return err;
      }
    }
  })

module.exports = dbs