/**
## /utils/logger 🪵
This module provides a logging utility for the XYZ API. The LOG process environment variable will be split into an array to determine which logs should be written out.

Possible log values are:

- req_url: Logs the url of the request.
- query_params: Logs query parameters sent to the query endpoint.
- query: Logs the sql to executed by calling the query endpoint.
- view-req-url: Logs the url of the requested view.
- cloudfront: Logs responses from requests made to cloudfront e.g. <staus_code> - <endpoint>
- mailer: Logs the response from email sending.
- mailer_body: Logs email from and two with the body.
- reqhost: Logs the host for the request.
- workspace: Logs responses for requests made to /workspace.

By default the logs are only written to the stdout console.

It is possible to set the LOGGER process env to write logs to the logflare api. A valid source and apikey must be provided in the LOGGER env value.

```
"LOGGER": "logflare:apikey=🤫&source=🤫"
```

Alternatively logs can be written into a table on any of the configured DBS_* connections. The dbs parameter value must match a DBS_* connection in the process env.

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

import crypto from 'crypto';

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
@param {string} [key='err'] The log level or key.
*/
export default function log(log, key = 'err') {
  // Check whether the log for the key should be logged.
  if (!logs.has(key)) return;

  // Write log to logger if configured.
  logger?.(log, key);

  if (key === 'err') {
    // Log errors as such.
    console.error(log);
    return;
  }

  // Log to stdout.
  console.log(log);
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
  const table = params.table.replace(/[^a-zA-Z0-9_.]/g, '');

  return async (log, key) => {
    // Dynamic import to avoid circular dependency (dbs.js imports logger.js).
    const { default: dbs } = await import('./dbs.js');

    // Log messages can be string or objects
    // Objects must be parsed as string for the PostgreSQL log table schema.
    const logstring = typeof log === 'string' ? log : JSON.stringify(log);

    //This is to pull the short Error message from the stack
    const errorMessage = log.err?.toString().split('\n')[0];

    try {
      await dbs[params.dbs](
        `INSERT INTO ${table} (process, datetime, key, log, message)
        VALUES ($1, $2, $3, $4, $5)`,
        [process_id, parseInt(Date.now() / 1000), key, logstring, errorMessage],
        3000,
      );
    } catch (error) {
      console.error('Error while logging to database:', error);
    }
  };
}
