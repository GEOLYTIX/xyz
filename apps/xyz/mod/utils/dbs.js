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

// At least one attempt is made if the RETRY_LIMIT is not a positive number.
const RETRY_LIMIT = Number.parseInt(xyzEnv.RETRY_LIMIT) || 1;

const RETRY_CODES = new Set([
  '53300', // too_many_connections
  '57P01', // admin_shutdown
  '57P02', // crash_shutdown
  '57P03', // cannot_connect_now
  '08000', // connection_exception
  '08006', // connection_failure
]);

const INITIAL_RETRY_DELAY = 1000;

const dbs = {};

// Initialize database pools and create query functions
Object.keys(xyzEnv)
  .filter((key) => key.startsWith('DBS_'))
  .forEach((key) => {
    const id = key.slice(4);

    const pool = new Pool({
      connectionString: xyzEnv[key],
      connectionTimeoutMillis: 5000,
      dbs: id, // label for logging
      // idleTimeoutMillis: 30000,
      // keepAlive: true,
      max: 20, // Maximum number of clients in the pool
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error(err);
    });

    dbs[id] = clientQuery.bind(pool);
  });

// Export dbs constant
export default dbs;

/**
@function clientQuery
@async

@description
The clientQuery method executes a query on the connection pool it is bound to.

Blocking queries are passed to the executeQuery method, which retries queries that fail with an error code in the RETRY_CODES set.

Nonblocking queries are attempted once without retry. The returned promise resolves true once a client is connected, without waiting for the query to complete. The promise resolves with the error if the client fails to connect. Errors from the query after the client has connected are logged, since the query result is not awaited.

@this {Pool} The connection pool to use for the query.
@param {string} query SQL query to execute
@param {Array} [variables] Parameters for the SQL query
@param {number} [timeout] Statement timeout in milliseconds. Defaults to xyzEnv.STATEMENT_TIMEOUT.
@param {Object} [options]
@property {boolean} [options.nonblocking] Resolve once connected without waiting for the query result.
@returns {Promise<Array|boolean|Error>} Query rows, true for a connected nonblocking query, or an error.
*/
async function clientQuery(query, variables, timeout, options = {}) {
  timeout ??= xyzEnv.STATEMENT_TIMEOUT;

  if (!options.nonblocking) {
    return executeQuery(this, query, variables, timeout);
  }

  // Nonblocking queries make a single attempt without retry.
  return new Promise((resolve) => {
    attemptQuery(this, query, variables, timeout, () => resolve(true)).then(
      (result) => {
        // No-op if the promise was already resolved on connect.
        resolve(result);

        // The result of a nonblocking query is not awaited and must be logged here.
        if (result instanceof Error) console.error(result);
      },
    );
  });
}

/**
@function executeQuery
@async

@description
The executeQuery method attempts a query up to RETRY_LIMIT times.

Queries which fail with an error code in the RETRY_CODES set are retried with an exponential backoff delay. The backoff delay starts after the client from the failed attempt has been released.

@param {Pool} pool The connection pool to use for the query.
@param {string} query SQL query to execute
@param {Array} [variables] Parameters for the SQL query
@param {number} [timeout] Statement timeout in milliseconds
@returns {Promise<Array|Error>} Query rows or the last error.
*/
async function executeQuery(pool, query, variables, timeout) {
  let lastError;

  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
    if (attempt > 1) {
      // Exponential backoff
      const delay = INITIAL_RETRY_DELAY * 2 ** (attempt - 2);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const result = await attemptQuery(pool, query, variables, timeout);

    if (!(result instanceof Error)) return result;

    console.error(result);

    // Return error if not in retry whitelist
    if (!RETRY_CODES.has(result.code)) return result;

    lastError = result;
  }

  // If we've exhausted all retries, return the last error
  return lastError;
}

/**
@function attemptQuery
@async

@description
The attemptQuery method connects a client from the pool and executes the query on the client.

The client is scoped to the attempt and is released exactly once, only if the client was connected.

@param {Pool} pool The connection pool to use for the query.
@param {string} query SQL query to execute
@param {Array} [variables] Parameters for the SQL query
@param {number} [timeout] Statement timeout in milliseconds
@param {Function} [onConnect] Called once the client is connected.
@returns {Promise<Array|Error>} Query rows or error.
*/
async function attemptQuery(pool, query, variables, timeout, onConnect) {
  let client;

  try {
    client = await pool.connect();

    onConnect?.();

    // Set statement timeout if specified
    if (timeout) {
      await client.query(`SET statement_timeout = ${Number.parseInt(timeout)}`);
    }

    const { rows } = await client.query(query, variables);

    return rows;
  } catch (err) {
    return err;
  } finally {
    // Force release in case of errors
    client?.release(true);
  }
}
