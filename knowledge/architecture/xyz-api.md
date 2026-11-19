---
type: Guide
title: XYZ API
description: The Express router, middleware chain and mod/ modules of the XYZ API, the request flow, and the endpoints MAPP and MAPP.UI call; use before changing a route, middleware or API module.
resource: ../../apps/xyz/router.js
tags: [xyz, api, architecture, express]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/XYZ
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: router
    resource: ../../apps/xyz/router.js
  - id: params
    resource: ../../apps/xyz/mod/middleware/validateRequestParams.js
  - id: auth
    resource: ../../apps/xyz/mod/middleware/validateRequestAuth.js
  - id: cors
    resource: ../../apps/xyz/mod/middleware/cors.js
  - resource: ../../apps/xyz/mod/workspace/_workspace.js
  - resource: ../../apps/xyz/README.md
  - resource: ../../apps/xyz/tests/mod/router.test.mjs
---
# XYZ API

XYZ is the Node.js API in [apps/xyz](../../apps/xyz) (`@geolytix/xyz-app`).
It serves the workspace, runs SQL query templates, authenticates users, and
serves the MAPP views and bundles. [MAPP and MAPP.UI](mapp.md) are its browser
clients; this page is the server side of that boundary.

## Entry points

- [router.js](../../apps/xyz/router.js) `createRouter(middleWare)` returns an
  Express router; the middleware array runs before each endpoint module.[^router]
- [server.js](../../apps/xyz/server.js) creates the router with the default
  chain `rootRedirect`, `validateRequestParams`, `validateRequestAuth`, mounts
  it, and listens on `PORT` unless it runs on Vercel. It exports the app as
  default and the router as `xyzRouter`.
- A host app extends XYZ instead of forking it. [apps/auth](../../apps/auth/server.js)
  creates its own router with `createRouter()` and adds custom routes;
  [apps/saml](../../apps/saml/server.js) imports the default app and adds the
  `${DIR}/saml/*` routes to it.
- The package exports only `./router`, `./server` and `./mod/*`. Importing `mod/utils/processEnv.js` assigns the frozen `globalThis.xyzEnv`.
  Modules read configuration from `xyzEnv`, not `process.env`. See
  [Server](../environment/server.md) and the other [environment](../environment/index.md) concepts.

## Request flow

Router-level handlers run in this order for every request:

1. `cors` adds CORS headers for origins in `CORS_ORIGINS`; without it, it does nothing.[^cors]
2. The rate limiter (`RATE_LIMIT`, `RATE_LIMIT_WINDOW`), then the cookie parser.
3. `${DIR}/api` responses get `Cache-Control: private, no-cache`.
4. Static files: `${DIR}/docs` from `docs/`, `${DIR}/public` and `${DIR}` from `public/`.
5. `requestSpan` traces the rest; then body parser, middleware chain and endpoint.

The default chain:

- `rootRedirect` redirects `/` to `DIR`.
- `validateRequestParams` merges path and query params, rejects keys outside
  `[A-Za-z0-9_-]`, deletes a `user` param, parses `true`/`false`/`null` and
  `[a,b]` arrays, defaults `language` to `en`, and stores the result on
  `req._params`.[^params]
- `validateRequestAuth` copies `req._params` to `req.params` and sets
  `req.params.user` from a token or cookie. An auth error returns 401. A
  `PRIVATE` instance redirects anonymous requests to `AUTH_PATH` or
  `/api/user/login`.[^auth]

The workspace, query, user, provider, sign and view modules also copy
`req._params`, so they work behind a chain without `validateRequestAuth`.

## Routes and modules

| Route | Module | Notes |
| --- | --- | --- |
| `api/workspace{/:key}` | [workspace/_workspace.js](../../apps/xyz/mod/workspace/_workspace.js) | `locales`, `locale`, `layer`; admin only: `scopes`, `test`, `compose`, `templates`. `roles` returns 410. |
| `api/query{/:template}` | [query.js](../../apps/xyz/mod/query.js) | GET and POST. Runs a SQL template against a `DBS_*` connection. |
| `api/user{/:method}{/:key}` | [user/_user.js](../../apps/xyz/mod/user/_user.js) | Account methods, eg. `admin`, `cookie`, `key`, `token`, `update`. |
| `api/user/login`, `logout`, `register`, `verify{/:key}` | [user/](../../apps/xyz/mod/user) | Mounted before `api/user` and without the middleware chain. |
| `api/provider{/:provider}` | [provider/_provider.js](../../apps/xyz/mod/provider/_provider.js) | `cloudfront`, `file`, `s3`. |
| `api/sign{/:signer}` | [sign/_sign.js](../../apps/xyz/mod/sign/_sign.js) | `cloudfront`, `cloudinary`, `file`, `s3`, plus one file signer per `SIGN_*` variable. |
| `view{/:template}`, `${DIR}/`, `/` | [view.js](../../apps/xyz/mod/view.js) | Serves a view template; `default_view` without a template. |

All routes are prefixed with `DIR`. Each dispatcher only calls a method which
is an own member of its method map, and rejects any other key.

## Modules behind the routes

- **workspace/** loads the workspace from `WORKSPACE` with
  [cache.js](../../apps/xyz/mod/workspace/cache.js), caches it for
  `WORKSPACE_AGE`, and resolves `src` references through
  [provider/getSrc.js](../../apps/xyz/mod/provider/getSrc.js).
  [composeObj.js](../../apps/xyz/mod/workspace/composeObj.js) merges templates
  and applies [roles](../workspace/roles.md) for the requesting user;
  `getLocale`, `getLayer` and `getTemplate` build on it. See
  [Templates](../workspace/templates.md) and [workspace environment](../environment/workspace.md).
- **workspace/templates/** holds the built-in templates. [_queries.js](../../apps/xyz/mod/workspace/templates/_queries.js)
  lists the SQL templates and flags (`layer`, `admin`, `value_only`). Layer formats use `wkt`, `geojson`, `mvt` and `cluster`;
  locations use `location_get`, `location_new`, `location_update` and
  `location_delete`; filters use `distinct_values` and `field_minmax`.
  [_views.js](../../apps/xyz/mod/workspace/templates/_views.js) maps view keys
  to `public/views/*.html`.
- **query.js** composes the template for the user, resolves the layer for
  layer templates, builds the SQL filter with [sqlFilter.js](../../apps/xyz/mod/utils/sqlFilter.js),
  substitutes `${param}` as whitelisted strings and `%{param}` as `$n` values,
  and sends the query to [dbs.js](../../apps/xyz/mod/utils/dbs.js). See
  [Layer data source](../workspace/layer/data-source.md) and [Databases](../environment/databases.md).
- **user/** holds the ACL ([acl.js](../../apps/xyz/mod/user/acl.js)), token
  and cookie authentication ([auth.js](../../apps/xyz/mod/user/auth.js)) and
  the account methods. See [JWT claims](../environment/jwt-claims.md).
- **view.js** substitutes `{{key}}` in the view with whitelisted string params
  and `dir`, `authPath`, `login` and `title` from `xyzEnv`.

## How XYZ serves MAPP

- The `default_view` sets `data-dir="{{dir}}"` on the head and loads
  `public/js/lib/mapp.js` and `ui.js`; MAPP reads `mapp.host` from it.
- The view script requests `api/workspace/locales` and
  `api/workspace/locale?layers=true`. MAPP requests `api/workspace/layer` for
  a location's layer and `api/query` for features and locations. MAPP.UI adds
  filter templates, `api/user/*` and `api/sign/cloudinary`.
- The client only sends template and layer keys. SQL, `dbs` and role
  restrictions stay in the workspace on the server.
- The bundles are build outputs; see [Monorepo](monorepo.md). For pages on
  another origin see [The @geolytix/mapp package](mapp-package.md).

## Where to change

- A new endpoint: a route in `router.js`, a module under `mod/`, and a test in
  [router.test.mjs](../../apps/xyz/tests/mod/router.test.mjs).
- A new built-in query: a template file and an entry in `_queries.js`.
  A deployment adds its own in `workspace.templates` instead.
- Param or auth rules: the middleware modules. A host which builds its own
  chain must keep `validateRequestParams` before `validateRequestAuth`.
- A new environment variable: `processEnv.js` and an environment concept.
- Tests: [apps/xyz/tests](../../apps/xyz/tests) mirrors `mod/`; run
  `pnpm test:xyz`, see [TESTING.md](../../TESTING.md).

## Corrections to the Wiki

The Wiki said endpoint modules must assign `req._params`; the default chain and
the endpoints already do.[^wiki] Its route table lacked `verify{/:key}`,
`cors` and the `templates` key; `roles` now returns 410.

[^wiki]: XYZ Wiki page at revision 3fc379b
[^router]: apps/xyz/router.js
[^params]: apps/xyz/mod/middleware/validateRequestParams.js
[^auth]: apps/xyz/mod/middleware/validateRequestAuth.js
[^cors]: apps/xyz/mod/middleware/cors.js
