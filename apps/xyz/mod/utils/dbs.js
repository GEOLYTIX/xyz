/**
@module /utils/dbs
@description
## /utils/dbs
Database connection and query management module that creates connection pools for multiple databases based on xyzEnvironment variables prefixed with 'DBS_'.

The [node-postgres]{@link https://www.npmjs.com/package/pg} package is required to create a [new connection Pool]{@link https://node-postgres.com/apis/pool} for DBS connections.

A DBS connection string with a `|rls=<role>` suffix is a row level security connection. Every query on the connection runs in a transaction as the role with the requesting tenant id set as `app.tenant_id`.

@requires pg
@requires /utils/logger
@requires module:/utils/processEnv
*/

import pg from 'pg';

const { Pool } = pg;

import logger from './logger.js';

const RETRY_LIMIT = xyzEnv.RETRY_LIMIT;

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
    const id = key.split('_')[1];

    const { connectionString, rls } = splitRlsRole(xyzEnv[key]);

    // A connection with an invalid rls role must not be created since its queries would run unfenced.
    if (rls instanceof Error) {
      console.warn(`${key}: ${rls.message}`);
      return;
    }

    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
      dbs: id,
      idleTimeoutMillis: 30000, // 5 seconds
      keepAlive: true, // 30 seconds
      max: 20, // Maximum number of clients in the pool
      rls,
    });

    // Handle pool errors
    pool.on('error', (err, client) => {
      console.error(err);
    });

    dbs[id] = clientQuery.bind(pool);

    // The query module must know which connections require a tenant.
    dbs[id].rls = rls;
  });

// Export dbs constant
export default dbs;

/**
@function splitRlsRole

@description
The method splits only a trailing `|rls=<role>` off a DBS value, so a pipe elsewhere, eg. in a password, stays in the connectionString.
The role must be a plain Postgres identifier since it is interpolated into the SET ROLE statement; any other role is returned as an error.

@param {string} value The DBS_* connection value from the xyzEnv.
@returns {Object} The connectionString and the rls role.
@property {string} connectionString The connection value without the rls suffix.
@property {string|Error} [rls] The rls role; undefined without the suffix, an Error for an invalid role.
*/
function splitRlsRole(value) {
  const match = /\|rls=([^|]*)$/.exec(value);

  if (!match) return { connectionString: value };

  const role = match[1];

  return {
    connectionString: value.slice(0, match.index),
    rls: /^[a-z_][a-z0-9_]*$/.test(role)
      ? role
      : new Error(`Invalid rls role: ${role}`),
  };
}

/**
@function clientQuery
@async

@description
The clientQuery method creates a client connection from the provided Pool and executes a query on this pool.

A row level security connection must not be queried without an integer tenant_id. The method shortcircuits with an error before a client is connected.

The query on a row level security connection is passed to the rlsQuery method.

@param {string} query SQL query to execute
@param {Array} [variables] Parameters for the SQL query
@param {number} [timeout] Statement timeout in milliseconds
@param {number} [tenant_id] The tenant id required by a row level security connection.
@param {Pool} [pool=this] The connection pool to use for the query.
@returns {Promise<Array|Error>} Query results or error object
*/
async function clientQuery(query, variables, timeout, tenant_id, pool = this) {
  if (pool.options.rls && !Number.isInteger(tenant_id)) {
    return new Error(
      `DBS ${pool.options.dbs} requires a tenant_id for row level security.`,
    );
  }

  let retryCount = 0;
  let lastError;
  let client;

  while (retryCount < RETRY_LIMIT) {
    try {
      client = await pool.connect();

      timeout ??= xyzEnv.STATEMENT_TIMEOUT;

      if (pool.options.rls) {
        return await rlsQuery(client, pool.options.rls, tenant_id, {
          query,
          timeout,
          variables,
        });
      }

      // Set statement timeout if specified
      if (timeout) {
        await client.query(
          `SET statement_timeout = ${Number.parseInt(timeout)}`,
        );
      }

      const { rows } = await client.query(query, variables);

      return rows;
    } catch (err) {
      console.error(err);

      // Return error if not in retry whitelist
      if (!RETRY_CODES.has(err.code)) return err;

      retryCount++;

      if (retryCount < RETRY_LIMIT) {
        // Exponential backoff
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
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
@function rlsQuery
@async

@description
The method runs one query in a transaction as the rls role with the tenant_id set as `app.tenant_id`; every setting is transaction-local.
A failed transaction is not committed and is rolled back when clientQuery destroys the client on release.

@param {Object} client The client connected from the row level security Pool.
@param {string} role The rls role of the connection.
@param {number} tenant_id The tenant id the query is fenced to.
@param {Object} params The query params.
@property {string} params.query SQL query to execute.
@property {number} [params.timeout] Statement timeout in milliseconds.
@property {Array} [params.variables] Parameters for the SQL query.
@returns {Promise<Array>} Query results.
*/
async function rlsQuery(
  client,
  role,
  tenant_id,
  { query, timeout, variables },
) {
  await client.query('BEGIN');

  await client.query(`SET LOCAL ROLE "${role}"`);

  await client.query(`SELECT set_config('app.tenant_id', $1, true)`, [
    String(tenant_id),
  ]);

  if (timeout) {
    await client.query(
      `SET LOCAL statement_timeout = ${Number.parseInt(timeout)}`,
    );
  }

  const { rows } = await client.query(query, variables);

  await client.query('COMMIT');

  return rows;
}
