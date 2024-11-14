/**
 * @module /utils/dbs
 * @description
 * ## /utils/dbs
 *  Database connection and query management module that creates connection pools for multiple databases
 * based on environment variables prefixed with 'DBS_'.
*/

const { Pool } = require('pg');
const logger = require('./logger');

/** @type {Object.<string, Function>} Object containing database query functions */
const dbs = {};

/** @constant {number} RETRY_LIMIT Maximum number of retry attempts for failed queries */
const RETRY_LIMIT = 3;

/** @constant {number} INITIAL_RETRY_DELAY Base delay in milliseconds between retry attempts */
const INITIAL_RETRY_DELAY = 1000;

/**
 * Helper function to pause execution
 * @param {number} ms - Time to sleep in milliseconds
 * @returns {Promise<void>}
 * @private
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize database pools and create query functions
Object.keys(process.env)
  .filter(key => key.startsWith('DBS_'))
  .forEach(key => {
    /**
     * @type {Pool}
     * @private
     */
    const pool = new Pool({
      connectionString: process.env[key],
      keepAlive: true,
      connectionTimeoutMillis: 5000,    // 5 seconds
      idleTimeoutMillis: 30000,         // 30 seconds
      max: 20                           // Maximum number of clients in the pool
    });

    // Handle pool errors
    pool.on('error', (err, client) => {
      logger({
        err,
        message: 'Unexpected error on idle client',
        pool: key.split('_')[1]
      });
    });

    /**
     * Executes a database query with retry logic
     * @async
     * @param {string} query - SQL query to execute
     * @param {Array} [variables] - Parameters for the SQL query
     * @param {number} [timeout] - Statement timeout in milliseconds
     * @returns {Promise<Array|Error>} Query results or error object
     * @throws {Error} Database connection or query errors
     */
    dbs[key.split('_')[1]] = async (query, variables, timeout) => {
      let retryCount = 0;
      let lastError;

      while (retryCount < RETRY_LIMIT) {
        /** @type {import('pg').PoolClient} */
        let client;

        try {
          client = await pool.connect();

          // Set statement timeout if specified
          if (timeout || process.env.STATEMENT_TIMEOUT) {
            await client.query(`SET statement_timeout = ${parseInt(timeout) || parseInt(process.env.STATEMENT_TIMEOUT)
              }`);
          }

          const { rows } = await client.query(query, variables);
          return rows;

        } catch (err) {
          lastError = err;

          // Log the error with retry information
          logger({
            err,
            query,
            variables,
            retry: retryCount + 1,
            pool: key.split('_')[1]
          });

          /**
           * Determine if error is retryable
           * @type {boolean}
           * @private
           */
          const isRetryable = (
            err.code === 'ECONNRESET' ||    // Connection reset by peer
            err.code === 'ECONNREFUSED' ||  // Connection refused
            err.code === '57P01' ||         // Admin shutdown
            err.code === '57P02' ||         // Crash shutdown
            err.code === '57P03' ||         // Cannot connect now
            err.message.includes('Connection terminated unexpectedly')
          );

          if (!isRetryable) {
            return err;
          }

          retryCount++;

          if (retryCount < RETRY_LIMIT) {
            // Exponential backoff
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1);
            await sleep(delay);
          }

        } finally {
          if (client) {
            client.release(true);  // Force release in case of errors
          }
        }
      }

      // If we've exhausted all retries, return the last error
      return lastError;
    };
  });

/**
 * Database interface object containing query functions for each configured database
 * @type {Object.<string, function(string, Array=, number=): Promise<Array|Error>>}
 */
module.exports = dbs;