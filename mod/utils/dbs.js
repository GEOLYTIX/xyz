/**
@module /utils/dbs
*/

const { Pool } = require('pg');

const logger = require('./logger');

const dbs = {};

Object.keys(process.env)

  // Filter keys which start with DBS
  .filter((key) => key.startsWith('DBS_'))

  .forEach((key) => {
    const pool = new Pool({
      connectionString: process.env[key],
      keepAlive: true,
    });

    dbs[key.split('_')[1]] = async (query, variables, timeout) => {
      try {
        const client = await pool.connect();

        if (timeout || process.env.STATEMENT_TIMEOUT) {
          await client.query(
            `SET statement_timeout = ${parseInt(timeout) || parseInt(process.env.STATEMENT_TIMEOUT)}`,
          );
        }

        const { rows } = await client.query(query, variables);

        client.release();

        return rows;
      } catch (err) {
        logger({ err, query, variables });
        return err;
      }
    };
  });

module.exports = dbs;
