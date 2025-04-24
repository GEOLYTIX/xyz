/**
@module /utils/dbs
@description
## /utils/dbs
Database connection and query management module that creates connection pools for multiple databases based on xyzEnvironment variables prefixed with 'DBS_'.

The [node-postgres]{@link https://www.npmjs.com/package/pg} package is required to create a [new connection Pool]{@link https://node-postgres.com/apis/pool} for DBS connections.

@requires pg
@requires /utils/logger
@requires module:/utils/processEnv
*/

import pg from 'pg';

const { Pool } = pg;

import logger from './logger.js';

const RETRY_LIMIT = xyzEnv.RETRY_LIMIT;

const INITIAL_RETRY_DELAY = 1000;

const dbs = {};

// Initialize database pools and create query functions
Object.keys(xyzEnv)
  .filter((key) => key.startsWith('DBS_'))
  .forEach((key) => {
    const id = key.split('_')[1];

    const pool = new Pool({
      connectionString: xyzEnv[key],
      connectionTimeoutMillis: 5000,
      dbs: id,
      idleTimeoutMillis: 30000, // 5 seconds
      keepAlive: true, // 30 seconds
      max: 20, // Maximum number of clients in the pool
    });

    // Handle pool errors
    pool.on('error', (err, client) => {
      logger({
        err,
        message: 'Unexpected error on idle client',
        pool: id,
      });
    });

    // Assigning clientQuery method to dbs property.
    dbs[id] = async (query, variables, timeout) =>
      await clientQuery(pool, query, variables, timeout);
  });

// Export dbs constant
export default dbs;

/**
@function clientQuery
@async


@description
The clientQuery method creates a client connection from the provided Pool and executes a query on this pool.

@param {Pool} pool The node-postgres connection Pool for a Client connection.
@param {string} query SQL query to execute
@param {Array} [variables] Parameters for the SQL query
@param {number} [timeout] Statement timeout in milliseconds
@returns {Promise<Array|Error>} Query results or error object
@throws {Error} Database connection or query errors
*/
async function clientQuery(pool, query, variables, timeout) {
  let retryCount = 0;
  let lastError;
  let client;

  while (retryCount < RETRY_LIMIT) {
    try {
      client = await pool.connect();

      timeout ??= xyzEnv.STATEMENT_TIMEOUT;

      // Set statement timeout if specified
      if (timeout) {
        await client.query(`SET statement_timeout = ${parseInt(timeout)}`);
      }

      const { rows } = await client.query(query, variables);

      return rows;
    } catch (err) {
      // Log the error with retry information
      logger({
        err,
        pool: pool.options.dbs,
        query,
        retry: retryCount + 1,
        variables,
      });

      retryCount++;

      if (retryCount < RETRY_LIMIT) {
        // Exponential backoff
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1);
        await sleep(delay);
      }

      lastError = err;
    } finally {
      if (client) {
        client.release(true); // Force release in case of errors
      }
    }
  }

  // If we've exhausted all retries, return the last error
  return lastError;
}

/**
@function sleep
@description
Helper function to pause execution

@param {number} ms Time to sleep in milliseconds
@returns {Promise<void>}
*/
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
