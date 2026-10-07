/**
@module /utils/dbs
@description
## /utils/dbs
Database connection and query management module that creates connection pools for multiple databases based on xyzEnvironment variables prefixed with 'DBS_'.

The [node-postgres]{@link https://www.npmjs.com/package/pg} package is required to create a [new connection Pool]{@link https://node-postgres.com/apis/pool} for DBS connections.

@requires pg
@requires /utils/logger
@requires /utils/telemetry
@requires module:/utils/processEnv
*/

import pg from 'pg';

const { Pool } = pg;

import logger from './logger.js';
import { activeSpan, flushAfter, withSpan } from './telemetry.js';

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
      idleTimeoutMillis: 10000,
      keepAlive: true,
      dbs: id, // label for logging
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

Nonblocking queries are attempted once without retry. The returned promise resolves true once the query has been sent to the database, without waiting for the query to complete. The query is sent before the caller can respond, so the database will execute the query even if a serverless process is frozen after the response. The promise resolves with the error if the client fails to connect or the statement timeout cannot be set. Errors from the query after it has been sent are logged, since the query result is not awaited.

@this {Pool} The connection pool to use for the query.
@param {string} query SQL query to execute
@param {Array} [variables] Parameters for the SQL query
@param {number} [timeout] Statement timeout in milliseconds. Defaults to xyzEnv.STATEMENT_TIMEOUT.
@param {Object} [options]
@property {boolean} [options.nonblocking] Resolve once the query is sent without waiting for the query result.
@returns {Promise<Array|boolean|Error>} Query rows, true for a sent nonblocking query, or an error.
*/
async function clientQuery(query, variables, timeout, options = {}) {
  timeout ??= xyzEnv.STATEMENT_TIMEOUT;

  const attributes = {
    'db.system.name': 'postgresql',
    'xyz.dbs': this.options.dbs,
    'xyz.dbs.statement_timeout': timeout == null ? undefined : String(timeout),
    'xyz.dbs.nonblocking': !!options.nonblocking,
  };

  if (!options.nonblocking) {
    return withSpan('dbs.query', attributes, () =>
      executeQuery(this, query, variables, timeout),
    );
  }

  // Nonblocking queries make a single attempt without retry.
  // The span ends once the query completes, which may be after the response has been sent.
  return new Promise((resolve) => {
    // The result of a nonblocking query is not awaited and must be logged here.
    // Resolving is a no-op if the promise was already resolved once the query was sent.
    const settle = (result) => {
      resolve(result);
      if (result instanceof Error) console.error(result);
    };

    const querySpan = withSpan('dbs.query', attributes, () =>
      attemptQuery(this, query, variables, timeout, () => resolve(true)),
    );

    // The span ends after the response has been sent and must be flushed once the query completes.
    flushAfter(querySpan);

    querySpan.then(settle, settle);
  });
}

/**
@function executeQuery
@async

@description
The executeQuery method attempts a query up to RETRY_LIMIT times.

Queries which fail with an error code in the RETRY_CODES set are retried with an exponential backoff delay. The backoff delay starts after the client from the failed attempt has been released.

The reason for a retry and the backoff delay are logged with the `dbs_retry` key, as well as the last error once the retries are exhausted.

@param {Pool} pool The connection pool to use for the query.
@param {string} query SQL query to execute
@param {Array} [variables] Parameters for the SQL query
@param {number} [timeout] Statement timeout in milliseconds
@returns {Promise<Array|Error>} Query rows or the last error.
*/
async function executeQuery(pool, query, variables, timeout) {
  const span = activeSpan();

  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
    span.setAttribute('xyz.dbs.attempts', attempt);

    const result = await attemptQuery(pool, query, variables, timeout);

    if (Array.isArray(result)) {
      span.setAttribute('xyz.dbs.rows', result.length);
    }

    if (!(result instanceof Error)) return result;

    span.addEvent('dbs.error', {
      attempt,
      'error.type': result.code ?? result.name,
      'error.message': result.message,
    });

    console.error(result);

    // Return error if not in retry whitelist
    if (!RETRY_CODES.has(result.code)) return result;

    if (attempt === RETRY_LIMIT) {
      logger(
        {
          attempts: attempt,
          code: result.code,
          dbs: pool.options.dbs,
          message: 'Retries exhausted.',
          reason: result.message,
        },
        'dbs_retry',
      );

      // If we've exhausted all retries, return the last error
      return result;
    }

    // Exponential backoff
    const delay = INITIAL_RETRY_DELAY * 2 ** (attempt - 1);

    logger(
      {
        attempt,
        code: result.code,
        dbs: pool.options.dbs,
        delay,
        message: `Retry ${attempt + 1} of ${RETRY_LIMIT} in ${delay}ms.`,
        reason: result.message,
      },
      'dbs_retry',
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
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
@param {Function} [onSent] Called once the query has been sent to the database.
@returns {Promise<Array|Error>} Query rows or error.
*/
async function attemptQuery(pool, query, variables, timeout, onSent) {
  let client;

  try {
    // The pool counts before connecting show whether the client must wait for a connection.
    client = await withSpan(
      'dbs.connect',
      {
        'xyz.dbs': pool.options.dbs,
        'xyz.dbs.pool.total': pool.totalCount,
        'xyz.dbs.pool.idle': pool.idleCount,
        'xyz.dbs.pool.waiting': pool.waitingCount,
      },
      () => pool.connect(),
    );

    // Set statement timeout if specified
    if (timeout != null) {
      await client.query(`SET statement_timeout = ${Number.parseInt(timeout)}`);
    }

    // The idle client writes the query to the socket immediately.
    const pending = client.query(query, variables);

    // The database will execute the query even if the process is frozen after a nonblocking response.
    onSent?.();

    const { rows } = await pending;

    return rows;
  } catch (err) {
    return err;
  } finally {
    // Force release in case of errors
    client?.release(true);
  }
}
