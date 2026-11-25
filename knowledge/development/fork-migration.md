---
type: Guide
title: Migrating a v4 fork
description: What changes for a fork or custom host moving from the flat v4 repository to the v5 monorepo - entry points, file paths, Varlock, cookies, params and composeObj; use when updating a fork or a host which imports XYZ modules.
resource: ../../apps/xyz/server.js
tags: [development, migration, monorepo, v5]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Monorepo/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: env
    resource: ../../apps/xyz/mod/utils/processEnv.js
  - id: compose
    resource: ../../apps/xyz/mod/workspace/composeObj.js
  - id: auth
    resource: ../../apps/xyz/mod/middleware/validateRequestAuth.js
  - id: sig
    resource: ../../apps/auth/providerRequestSignature.js
  - resource: ../../apps/xyz/package.json
  - resource: ../../utils/sync-fork.js
---
# Migrating a v4 fork

v5 split the flat v4 repository (`lib/`, `api/`, `mod/`, root `express.js`)
into the [monorepo](../architecture/monorepo.md). A fork or a host which
imports XYZ modules must change:[^wiki]

- **Entry point.** The server is `apps/xyz/server.js`; the root
  `express.js` and `api/api.js` are gone. Every import path changed. The
  `@geolytix/xyz-app` package exports only `./router`, `./server` and
  `./mod/*`, with no default export. Build a custom server from
  `createRouter()`; see [XYZ API](../architecture/xyz-api.md).
- **File paths.** `file:` references in workspaces and launch configurations
  resolve from `XYZ_CWD`, which defaults to the repository root. Remove
  `../../` prefixes. See [Server](../environment/server.md).
- **Environment.** Varlock replaces `dotenv`. A plain
  `node apps/xyz/server.js` reads no `.env` file; use `pnpm dev` or
  `varlock run`. See the [Varlock README](../../varlock/README.md).
- **Cookies.** `COOKIE_PROPS` defaults to
  `Secure; HttpOnly; SameSite=Strict; Path=${DIR}`.[^env] A deployment on
  plain HTTP must set it without `Secure`.
- **Params.** Middleware stores validated params on `req._params`. The
  default `validateRequestAuth` copies them to `req.params`, and the built-in
  endpoint modules copy them again.[^auth] A custom endpoint behind a custom
  chain must run `Object.assign(req.params, req._params)` itself.
- **composeObj.** A host which composes workspace objects passes the user
  object, not a roles array: `composeObj(obj, user)`.[^compose]
- **keyVerification.** The v4 `keyVerification()` is gone. Provider request
  signature checks are in [apps/auth/providerRequestSignature.js](../../apps/auth/providerRequestSignature.js),
  which no server mounts by default.[^sig] A deployment relying on signed
  provider URLs mounts it in its own chain.
- **Library tests.** The Wiki said the v4 `tests/lib` and `tests/browser`
  suites had no replacement. That is obsolete: MAPP and MAPP.UI have browser
  test suites; see [TESTING.md](../../TESTING.md).
- **MongoDB.** The mongodb provider was removed.

## Keeping a fork current

[utils/sync-fork.js](../../utils/sync-fork.js) helps sync a fork with the
upstream repository. Keep fork-specific code in plugins, workspace templates
or a host app built on `createRouter()`, so upstream merges stay small.

[^wiki]: Monorepo Wiki page at revision 3fc379b
[^env]: apps/xyz/mod/utils/processEnv.js
[^compose]: apps/xyz/mod/workspace/composeObj.js
[^auth]: apps/xyz/mod/middleware/validateRequestAuth.js
[^sig]: apps/auth/providerRequestSignature.js
