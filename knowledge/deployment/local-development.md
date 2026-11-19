---
type: Guide
title: Local development
description: Clone, install, build and run the XYZ monorepo on a local machine, with a minimal workspace, a VS Code launch configuration and the first-run checks.
tags: [deployment, setup, development, pnpm, varlock]
status: draft
resource: ../../apps/xyz/server.js
sources:
  - id: setup
    resource: ../../SETUP.md
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Getting-started
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: package
    resource: ../../package.json
  - id: workspace-yaml
    resource: ../../pnpm-workspace.yaml
  - id: xyz-package
    resource: ../../apps/xyz/package.json
  - id: varlock
    resource: ../../varlock/README.md
  - id: acl
    resource: ../../apps/xyz/mod/user/acl.js
  - id: devdb
    resource: ../../packages/devdb/start.js
---
# Local development

The repository is a pnpm workspace driven by Turborepo.[^workspace-yaml] This
concept replaces SETUP.md.[^setup]

The [monorepo](../architecture/monorepo.md) concept lists its packages: the
XYZ API and server (`apps/xyz`), the MAPP and MAPP.UI libraries, the auth and
SAML apps, and the devdb and testhost packages for tests. SETUP.md listed four
apps and omitted `apps/auth`.

Each app has a README with app-specific usage. In the browser, without a local
install, see [Codespaces](codespaces.md).

## Prerequisites

- `git` and Node.js 22 or later. CI runs Node 22; there is no `engines` field.
- pnpm 11. The root `packageManager` pins `pnpm@11.3.0`.[^package] SETUP.md
  and the Wiki still said pnpm 10.

## Clone, install, build

```bash
git clone https://github.com/GEOLYTIX/xyz.git
cd xyz
pnpm install
pnpm build
```

The MAPP and MAPP.UI bundles (`public/js/lib`, `public/css/mapp.css`,
`public/css/ui.css`) are gitignored on the development branches, so a branch
checkout must be built before the server can serve the default view. A
checkout of `main` or a release tag, eg. `--branch v5.0.7`, already contains
them. See [release builds](release-builds.md).

## Environment

The server reads [environment variables](../environment/index.md). The minimal
configuration is the repository workspace with one OSM tile layer:

```dotenv
WORKSPACE=file:./public/workspace.json
```

`file:` paths resolve from `XYZ_CWD`, which defaults to the repository root,
so `file:/public/workspace.json` resolves to the same file.

`apps/xyz/server.js` does not load `.env` itself; `dotenv` is no longer
imported since v5.[^wiki] An `.env` in the repository root is read when the
process runs through Varlock, which the `dev` scripts do
(`varlock run -- node --inspect server.js`, with `loadPath` set to the root).[^xyz-package]
Start from the examples in `varlock/`:

```bash
cp varlock/vanilla.env .env
cp varlock/vanilla.env.schema .env.schema
```

Declare new variables in `.env.schema`, and mark secrets sensitive so Varlock
redacts them. `pnpm exec varlock load --compact` validates the files. See
[varlock/README.md](../../varlock/README.md) for secret managers.[^varlock]
Commit neither `.env*` nor `.varlock.blob`.

Variables often set locally: `TITLE`, `SECRET` or `SECRET_KEY`, `DIR`,
`PRIVATE`/`PUBLIC`, `DBS_*`, `CUSTOM_TEMPLATES`, `TRANSPORT_*`, `SAML_*` and
`TRUSTED_RETURN_HOSTS`. Look each up with `pnpm knowledge:find <name>`.

## Databases and authentication

A database is only needed when the workspace, templates or ACL use one. Set a
[`DBS_*` connection](../environment/databases.md) per database. The ACL
variables `PRIVATE` and `PUBLIC` take a connection string and the ACL table,
separated by `|`; the schema defaults to `public`:

```dotenv
DBS_MAIN=postgres://user:password@localhost:5432/my_database
PRIVATE=postgres://user:password@localhost:5432/my_database|acl_schema.acl_table
```

SETUP.md showed `PRIVATE=localhost:5432|user:password|acl_table`, which the
ACL module does not parse.[^acl] For a local PostGIS database without an install,
run the devdb with `pnpm --filter=@geolytix/xyz-devdb start` (port 5433, or
`DEVDB_PORT`); it prints a `DBS_DEV` connection string.[^devdb] For a hosted
database, see [Neon](neon.md).

A `PRIVATE` SAML instance sets `AUTH_PATH=/saml`; `SAML_LOGIN` was removed in
v5.0.0. See [apps/saml/README.md](../../apps/saml/README.md).

Run the server as described in [running locally](running-locally.md).
For tests see [TESTING.md](../../TESTING.md), for the workflow and Biome
[DEVELOPING.md](../../DEVELOPING.md).

[^setup]: SETUP.md, folded into this concept.
[^wiki]: Wiki Getting-started page.
[^package]: Root package.json `packageManager` and scripts.
[^workspace-yaml]: pnpm-workspace.yaml packages list.
[^xyz-package]: apps/xyz/package.json dev script and `varlock.loadPath`.
[^varlock]: varlock/README.md.
[^acl]: apps/xyz/mod/user/acl.js splits `PRIVATE` or `PUBLIC` on `|`.
[^devdb]: packages/devdb/start.js; the root has no `devdb` script.
