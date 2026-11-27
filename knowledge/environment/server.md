---
type: Environment Variable
title: Server
description: PORT, DIR, ALIAS, XYZ_CWD, APP_ENV and the rate limit configure how the XYZ API is served.
resource: ../../apps/xyz/router.js
tags: [xyz, environment, server, deployment]
status: draft
x-xyz-variables: [PORT, DIR, ALIAS, XYZ_CWD, APP_ENV, RATE_LIMIT, RATE_LIMIT_WINDOW]
sources:
  - resource: ../../apps/xyz/router.js
  - resource: ../../apps/xyz/server.js
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/xyz/mod/utils/reqHost.js
  - resource: ../../apps/xyz/mod/middleware/rootRedirect.js
  - resource: ../../apps/xyz/tests/mod/utils/processEnv.test.mjs
---
# Server

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port the Express server listens on. |
| `DIR` | empty | Path prefix for every route, eg. `/geo`. |
| `ALIAS` | request host | Public host name used to build absolute URLs. |
| `XYZ_CWD` | repository root | Directory for local files and keys. |
| `APP_ENV` | none | Deployment environment name, eg. `development`. |
| `RATE_LIMIT` | `1000` | Requests per window per client. |
| `RATE_LIMIT_WINDOW` | `60000` | Rate limit window in milliseconds. |

## Paths and hosts

`DIR` mounts the API and the static `public` files under a common
prefix, eg. `DIR=/geo` serves the API at `/geo/api/...`. `processEnv.js` adds a
leading slash and removes a trailing slash, so `geo/` becomes `/geo`. When the
server uses the root redirect middleware, as `server.js` does, a request to `/`
redirects to `DIR`. Session cookies are scoped to `DIR` unless `COOKIE_PROPS`
is set.

`ALIAS` replaces the request host in the absolute URLs the user modules build,
eg. the links in registration and verification emails. Set it when XYZ runs
behind a proxy or a custom domain. A request from `localhost` always uses
`http://` and the request host; any other uses `https://`.

`XYZ_CWD` is the root for local paths: `file:` workspace and template sources,
the `public` directory, `SECRET_KEY` and `SIGN_*` key files.
`processEnv.js` defaults it to the repository root, not the process working
directory.

## Runtime

`PORT` only applies when the server starts itself. In a Vercel deployment the
platform serves the exported app and `PORT` is ignored.

`APP_ENV=development` stops browsers caching the static CSS and fonts outside
Vercel, so style changes show on reload. Telemetry reports `APP_ENV` as the
deployment environment when Vercel does not provide one.

The rate limit applies to every request through the router, including static
files, with standard `RateLimit` response headers. It counts per `req.ip`.
XYZ does not set the Express `trust proxy` option, so behind a proxy which
Express does not trust, all clients may share one limit.
