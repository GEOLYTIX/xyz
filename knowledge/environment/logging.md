---
type: Environment Variable
title: Logging
description: LOGS selects which log keys are written; LOGGER sends them to Logflare or a PostgreSQL table as well as stdout.
resource: ../../apps/xyz/mod/utils/logger.js
tags: [xyz, environment, logging, debugging]
status: draft
x-xyz-variables: [LOGS, LOGGER]
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Process-Environment
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../../apps/xyz/mod/utils/logger.js
  - resource: ../../apps/xyz/mod/utils/dbs.js
  - resource: ../../apps/xyz/mod/provider/getSrc.js
  - resource: ../../apps/xyz/mod/utils/resend.js
  - resource: ../../apps/xyz/tests/mod/utils/logger.test.mjs
---
# Logging

`LOGS` is a comma separated list of log keys. A module logs a message with a
key, and the message is written only if the key is listed. Errors are always
written to the console by the modules themselves, whatever `LOGS` holds.

```dotenv
LOGS=query,reqhost,workspace
```

| Key | Logs |
|---|---|
| `query_params` | Request parameters of the query API. |
| `query` | The SQL of a query. |
| `reqhost` | The host built for absolute URLs. |
| `workspace` | When the workspace has been cached. |
| `fetch` | Status and URL of an `https:` src request. |
| `xyzfetch` | Duration, status and reference of a `SIGN_*` src request. |
| `cloudfront` | Duration, status and URL of a CloudFront src request. |
| `mailer` | Template, sender and recipients of a sent email. |
| `mailer_body` | The body of a batch email. |
| `dbs_retry` | A retried query and its backoff, see [Databases](databases.md). |

The Wiki list omits `dbs_retry`.[^wiki] The v4 keys `req`, `req-url`,
`view-req-url`, `mvt`, `saml_response` and `templates` are no longer
emitted. Logged values have carriage returns and line feeds replaced, so a
message is one line.

The `query`, `query_params` and `mailer_body` keys can write user data and
email content to the logs. Enable them for debugging, not permanently.

## LOGGER

Logged messages always go to stdout. `LOGGER` sends them to a second store as
well, as `<type>:<URL search params>`. An unknown type is ignored.

Logflare needs an API key and source id; both are secret:

```dotenv
LOGGER=logflare:apikey=<key>&source=<source-id>
```

A PostgreSQL logger writes to a table on a [DBS_*](databases.md) connection.
`dbs` names the connection id and `table` the table, with an optional schema.
Characters other than letters, digits, `_` and `.` are removed from the table
name. A `dbs` without a `DBS_*` variable logs a warning and disables the
logger.

```dotenv
LOGGER=postgresql:dbs=MAIN&table=public.xyz_logs
```

```sql
CREATE TABLE public.xyz_logs (
  process VARCHAR,
  datetime BIGINT,
  key VARCHAR,
  log TEXT,
  message TEXT
);
```

`process` is a random id per server process, `datetime` is in Unix seconds and
`message` holds the first line of an error. Inserts are not awaited and are
not retried, and the connection must be allowed to insert into the table.

[^wiki]: Wiki Process-Environment page at revision 3fc379b.
