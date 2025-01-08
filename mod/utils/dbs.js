/**
@module /utils/dbs
*/

const { Pool } = require('pg');

const env = require('../../mapp_env.js')

const logger = require('./logger');

const dbs = {};

Object.keys(env)

  // Filter keys which start with DBS 
  .filter(key => key.startsWith('DBS_'))

  .forEach(key => {

    const pool = new Pool({
      connectionString: env[key],
      keepAlive: true
    });

    dbs[key.split('_')[1]] = async (query, variables, timeout) => {

      try {

        const client = await pool.connect()

        if (timeout || env.STATEMENT_TIMEOUT) {
          await client.query(`SET statement_timeout = ${parseInt(timeout) || parseInt(env.STATEMENT_TIMEOUT)}`)
        }

        const { rows } = await client.query(query, variables)

        client.release()

        return rows

      } catch (err) {

        logger({ err, query, variables })
        return err;
      }
    }
  })

module.exports = dbs