const { Pool } = require('pg');

const logger = require('./logger');

const dbs = {};

Object.keys(process.env)

  // Filter keys which start with DBS 
  .filter(key => /^DBS_/.test(key))

  .forEach(key => {

    const pool = new Pool({
      connectionString: process.env[key],
      options: `-c statement_timeout=${parseInt(process.env.STATEMENT_TIMEOUT) || 10000}`
    });

    dbs[key.split('_')[1]] = async (query, variables, timeout) => {

      try {

        const client = await pool.connect()

        timeout && await client.query(`SET statement_timeout = ${parseInt(timeout)}`)

        const { rows } = await client.query(query, variables)

        // Reset the statement timeout to value from process.env or default 10000 (10 seconds).
        timeout && await client.query(`SET statement_timeout = ${parseInt(process.env.STATEMENT_TIMEOUT) || 10000}`)

        client.release()

        return rows

      } catch (err) {

        logger({ err, query, variables })
        return err;
      }
    }
  })

module.exports = dbs