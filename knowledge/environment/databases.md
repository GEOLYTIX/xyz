---
type: Environment Variable
title: Databases
description: DBS_* variables define PostgreSQL connections; STATEMENT_TIMEOUT and RETRY_LIMIT apply to every query.
resource: ../../apps/xyz/mod/utils/dbs.js
tags: [xyz, environment, database, performance]
status: draft
x-xyz-variables: [DBS_*, STATEMENT_TIMEOUT, RETRY_LIMIT]
sources:
  - resource: ../../apps/xyz/mod/utils/dbs.js
  - resource: ../../apps/xyz/mod/query.js
  - resource: ../../apps/xyz/mod/workspace/getLayer.js
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/xyz/tests/mod/utils/dbs.test.mjs
---
# Databases

| Variable | Default | Purpose |
|---|---|---|
| `DBS_<id>` | none | PostgreSQL connection string for the connection `<id>`. |
| `STATEMENT_TIMEOUT` | `10000` | Statement timeout in milliseconds for each query. |
| `RETRY_LIMIT` | `3` | Attempts for a query which fails with a connection error. |

## Connections

Each `DBS_*` variable creates a connection pool when the dbs module loads. The
suffix is the connection id, eg. `DBS_MAIN=postgres://...` creates `MAIN`.
Workspaces refer to the id, not the variable:

```dotenv
DBS_MAIN=postgres://user:password@host:5432/database
```

A query template uses its own `dbs`, else the layer's, else the workspace's.
A layer without `dbs` takes the locale's. A query naming an id with no
`DBS_*` variable fails. The logger can also write to a table on a `DBS_*`
connection.

Each pool holds up to 20 clients, with a 5 second connection timeout and a
10 second idle timeout. These are fixed in the dbs module. Connection strings
contain credentials: keep them in a secret manager or the varlock schema, not
in committed environment files.

## Timeouts and retries

The statement timeout is set on the client before each query. A query
template's `statement_timeout` takes precedence over `STATEMENT_TIMEOUT`.

Queries which fail with a connection or shutdown error, eg. too many
connections, are retried up to `RETRY_LIMIT` attempts in total, with a backoff
of 1, 2, 4 seconds and so on. Other errors, such as SQL errors, are returned
without retry. Each retry is logged with the `dbs_retry` logger key.
Nonblocking queries are attempted once.

Use a positive integer for `RETRY_LIMIT`. `0` or a non-numeric value gives one
attempt. A negative value currently gives no attempt at all, so the query
returns nothing; this is a known gap in the dbs module.
