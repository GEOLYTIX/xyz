/**
## /utils/logger 🪵
This module provides a logging utility for the XYZ API. The LOG process environment variable will be split into an array to determine which logs should be written out.

Possible log values are:

- query_params: Logs query parameters sent to the query endpoint.
- query: Logs the sql to executed by calling the query endpoint.
- cloudfront: Logs responses from requests made to cloudfront e.g. <staus_code> - <endpoint>
- mailer: Logs the sent mail template.
- reqhost: Logs the host for the request.
- workspace: Logs responses for requests made to /workspace.
- dbs_retry: Logs the reason and backoff delay when a query is retried by the [dbs module]{@link module:/utils/dbs}, and when the retries are exhausted.
- sql: Logs every query sent to a database, not only the query endpoint's. The log has the query and the number of its variables, with the dbs property naming the DBS_* connection or `ACL` for the [acl module]{@link module:/user/acl}. ACL queries are logged without variables and with their string literals masked, since they carry passwords, tokens, and keys. A composing host may log queries from its own connections with the sql key, unless params.log is false.
- sql_variables: Logs the variable values of sql logs instead of their number. Variables can carry personal data, eg. user emails and the fields of a location, and should only be logged for debugging.

By default the logs are only written to the stdout console.

It is possible to set the LOGGER process env to write logs to the logflare api. A valid source and apikey must be provided in the LOGGER env value.

```
"LOGGER": "logflare:apikey=🤫&source=🤫"
```

Alternatively logs can be written into a table on any of the configured DBS_* connections. The dbs parameter value must match a DBS_* connection in the process env.

> **Warning:** The postgresql logger is legacy and should not be used in production. Every log is written with an insert into the log table, and keys like `sql` log every query, so an instance can roughly double its database writes. Log inserts are not retried, and errors from them are written only to the console.

```
"LOGGER": "postgresql:dbs=NEON&table=public.dev_logs"
```

The schema for the log table should be like so:
```sql
CREATE TABLE public.dev_logs (
  process VARCHAR,
  datetime BIGINT,
  key VARCHAR,
  message VARCHAR,
  log TEXT
);
```

@requires module:/utils/processEnv
@requires crypto

@module /utils/logger
*/

import crypto from 'node:crypto';

const logs = new Set(xyzEnv.LOGS?.split(',') || []);

// Errors should always be logged.
logs.add('err');

// Generates a unique for the process.
const process_id = crypto.randomBytes(3).toString('hex');

const logout = {
  logflare,
  postgresql,
};

const logger =
  xyzEnv.LOGGER &&
  Object.hasOwn(logout, xyzEnv.LOGGER.split(':')[0]) &&
  logout[xyzEnv.LOGGER.split(':')[0]]();

/**
@function log
@description
Logs a message to the configured logger or console.

@param {string|Object} log The message or object to log.
@param {string} key The log level or key.
*/
export default function log(log, key) {
  // Check whether the log for the key should be logged.
  if (!logs.has(key)) return;

  const sanitizedLog = {
    message: sanitizeLogValue(key === 'sql' ? sqlLog(log) : log),
    time: new Date(),
  };

  // Log structured, sanitized data to prevent CR/LF log injection.
  logger?.(sanitizedLog, key);

  // Log to stdout.
  console.log(sanitizedLog);
}

/**
@function sqlLog
@description
Replaces the variables of an sql log with a variable_count unless the sql_variables key is set as well, since variables can carry personal data.

@param {Object} log The sql log.
@returns {Object} The sql log to write.
*/
function sqlLog(log) {
  if (logs.has('sql_variables') || !Array.isArray(log?.variables)) return log;

  const { variables, ...rest } = log;

  return { ...rest, variable_count: variables.length };
}

function sanitizeLogValue(value) {
  if (typeof value === 'string') return value.replaceAll(/[\n\r]/g, '_');

  if (Array.isArray(value)) return value.map(sanitizeLogValue);

  if (value instanceof Error) {
    return {
      message: sanitizeLogValue(value.message),
      name: value.name,
      stack: sanitizeLogValue(value.stack),
    };
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        sanitizeLogValue(value),
      ]),
    );
  }

  return value;
}

/**
@function logflare
@description
Configures the Logflare logger.

@returns {Function} A function that logs messages to Logflare.
*/
function logflare() {
  const params = Object.fromEntries(
    new URLSearchParams(xyzEnv.LOGGER.split(':')[1]).entries(),
  );

  return (log, key) => {
    fetch(`https://api.logflare.app/logs/json?source=${params.source}`, {
      body: JSON.stringify({
        [process_id]: log,
        key,
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': params.apikey,
      },
      method: 'post',
    }).catch((err) => {
      console.error(err);
    });
  };
}

/**
@function postgresql
@description
Configures the PostgreSQL logger.

@returns {Function} A function that logs messages to a PostgreSQL database.
*/
function postgresql() {
  const params = Object.fromEntries(
    new URLSearchParams(xyzEnv.LOGGER.split(':')[1]).entries(),
  );

  if (!xyzEnv[`DBS_${params.dbs}`]) {
    console.warn(`Logger module unable to find dbs=${params.dbs}`);
    return;
  }

  // Sanitize the params.table once at init to ensure no SQL injection.
  const table = params.table.replaceAll(/[^a-zA-Z0-9_.]/g, '');

  return async (log, key) => {
    // Dynamic import to avoid circular dependency (dbs.js imports logger.js).
    const { default: dbs } = await import('./dbs.js');

    // Log messages can be string or objects
    // Objects must be parsed as string for the PostgreSQL log table schema.
    const logstring = typeof log === 'string' ? log : JSON.stringify(log);

    //This is to pull the short Error message from the stack
    const errorMessage = log.err?.toString().split('\n')[0];

    // A retried insert would log dbs_retry, and a logged insert would log sql,
    // each inserting another log. Log inserts are therefore neither retried nor logged.
    dbs[params.dbs]({
      log: false,
      nonblocking: true,
      query: `INSERT INTO ${table}
      (process, datetime, key, log, message)
      VALUES ($1, $2, $3, $4, $5)`,
      timeout: 3000,
      variables: [
        process_id,
        Number.parseInt(Date.now() / 1000),
        key,
        logstring,
        errorMessage,
      ],
    });
  };
}
