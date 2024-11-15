/**
@module /utils/dbs
@description
## /utils/dbs
Database connection and query management module that creates connection pools for multiple databases based on environment variables prefixed with 'DBS_'.

The [node-postgres]{@link https://www.npmjs.com/package/pg} package is required to create a [new connection Pool]{@link https://node-postgres.com/apis/pool} for DBS connections.

@requires pg
@requires /utils/logger
*/

const { Pool } = require('pg');

const logger = require('./logger');

/** @constant {number} RETRY_LIMIT Maximum number of retry attempts for failed queries */
const RETRY_LIMIT = 3;

/** @constant {number} INITIAL_RETRY_DELAY Base delay in milliseconds between retry attempts */
const INITIAL_RETRY_DELAY = 1000;

/** @constant {Object.<string, Function>} dbs containing database query functions */
const dbs = {};

// Initialize database pools and create query functions
Object.keys(process.env)
  .filter(key => key.startsWith('DBS_'))
  .forEach(key => {

    /** 
    @type {Pool} @private
    */
    const pool = new Pool({
      dbs: key.split('_')[1],
      connectionString: process.env[key],
      keepAlive: true,
      connectionTimeoutMillis: 5000, // 5 seconds
      idleTimeoutMillis: 30000,      // 30 seconds
      max: 20                        // Maximum number of clients in the pool
    });

    // Handle pool errors
    pool.on('error', (err, client) => {
      logger({
        err,
        message: 'Unexpected error on idle client',
        pool: key.split('_')[1]
      });
    });

    // Assigning clientQuery method to dbs property.
    dbs[key.split('_')[1]] = async (query, variables, timeout) => 
      await clientQuery(pool, query, variables, timeout)
  });

// Export dbs constant
module.exports = dbs;

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

      timeout ??= process.env.STATEMENT_TIMEOUT

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
        query,
        variables,
        retry: retryCount + 1,
        pool: pool.options.dbs
      });

      retryCount++;

      if (retryCount < RETRY_LIMIT) {
        // Exponential backoff
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1);
        await sleep(delay);
      }

      lastError = err

    } finally {
      if (client) {
        client.release(true);  // Force release in case of errors
      }
    }
  }

  // If we've exhausted all retries, return the last error
  return lastError;
};

/**
@function sleep
@description
Helper function to pause execution

@param {number} ms Time to sleep in milliseconds
@returns {Promise<void>}
*/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
