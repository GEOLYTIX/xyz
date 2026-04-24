# Setup And Run Guide

## What this repository contains

This repository is a `pnpm` workspace with three local packages:

- `apps/xyz`: the core XYZ API and Express server logic
- `apps/mapp`: the MAPP frontend library bundle
- `apps/saml`: optional SAML routes mounted by the root server

The repository root wires those packages together and exposes the commands you will usually run during local development.

## Prerequisites

Install these tools before you start:

- `git`
- `node` `22+`
- `pnpm` `10.10.0` or a compatible `pnpm 10`

Check your versions:

```bash
node --version
pnpm --version
```

## Clone and install

```bash
git clone https://github.com/GEOLYTIX/xyz.git
cd xyz
pnpm install
```

This installs the workspace dependencies for the root package and all apps under `apps/*`.

## Minimum local configuration

The server loads environment variables from a root `.env` file via `dotenv`.

Create `.env` in the repository root with a minimal local setup:

```env
PORT=3000
TITLE=GEOLYTIX | XYZ
SECRET=replace-this-with-a-long-random-string
WORKSPACE=file:./public/workspace.json
```

What these values do:

- `PORT`: local Express port. Defaults to `3000`.
- `TITLE`: used in rendered views and cookie naming.
- `SECRET`: used to sign JWTs and auth cookies.
- `WORKSPACE`: points XYZ at a workspace definition. `file:./public/workspace.json` uses the sample workspace already in this repo.

### Optional variables

Add these only when you need them:

- `DIR`: serve the app from a base path such as `/xyz`
- `PRIVATE`: require authentication for all requests using an ACL connection
- `PUBLIC`: enable optional authentication using an ACL connection
- `DBS_*`: database connection strings used by query/provider modules
- `CUSTOM_TEMPLATES`: merge additional templates into the workspace cache
- `SECRET_KEY`: path to a key file if you want the app to load the signing secret from disk instead of `.env`
- `TRANSPORT_EMAIL`, `TRANSPORT_PASSWORD`, `TRANSPORT_PORT`, `TRANSPORT_TLS`: email transport configuration
- `SAML_*`: SAML identity provider and certificate settings for the optional SAML flow

## Start the application

For the standard local server:

```bash
pnpm dev
```

That runs the root `server.js` with the Node inspector enabled.

If you do not want the inspector, run:

```bash
node server.js
```

Open the app at:

```text
http://localhost:3000/
```

If you set `DIR=/xyz`, use:

```text
http://localhost:3000/xyz
```

## What should work on first run

With the minimal `.env` above, the server should boot and serve the built frontend assets from `public/`.

Useful routes to test locally:

- `/`: default application view
- `/api/workspace`: resolved workspace payload
- `/public/js/lib/mapp.js`: bundled MAPP library asset

The sample `public/workspace.json` includes a minimal OpenStreetMap layer, which is enough for a basic local smoke test.

## Build commands

The repo uses Turborepo for workspace tasks.

Run all builds:

```bash
pnpm build
```

Rebuild the CSS bundles only:

```bash
pnpm mapp_css
pnpm ui_css
```

Generate JSDoc output:

```bash
pnpm generate-docs
```

## Run tests

Run the full workspace test suite:

```bash
pnpm test
```

Run the XYZ app tests only:

```bash
pnpm test:xyz
```

Run Biome checks manually:

```bash
pnpm exec biome check .
```

## Database-backed setups

You only need a database if your workspace templates, ACL flow, or provider/query configuration depend on one.

In that case, define one or more `DBS_*` environment variables and point your workspace/query templates at those connections.

Typical examples:

```env
DBS_MAIN=postgres://user:password@localhost:5432/my_database
PRIVATE=localhost:5432|user:password|acl_table
```

Use the exact connection and ACL values required by your workspace and auth setup.

## Optional SAML setup

The root server mounts SAML routes from `apps/saml`.

If you need SAML locally:

1. Install dependencies with `pnpm install`.
2. Add the required `SAML_*` variables to `.env`.
3. Start the root server as usual.

Mounted routes include:

- `/saml/login`
- `/saml/logout`
- `/saml/metadata`
- `/saml/acs`

If `DIR` is set, those routes are mounted under that base path.

## Troubleshooting

### Node version issues

If startup fails or you see ESM/runtime warnings, confirm you are on Node `22+`.

### `pnpm` version mismatch

If install behavior looks inconsistent, confirm you are using `pnpm 10` and reinstall dependencies:

```bash
pnpm --version
pnpm install
```

### Blank or incomplete app output

Check that:

- `.env` exists in the repository root
- `WORKSPACE` points to a valid source such as `file:./public/workspace.json`
- the server started on the expected `PORT`
- you are opening the correct path when `DIR` is set

### Auth routes not working

Check that `SECRET` or `SECRET_KEY` is configured. Token and cookie auth depend on it.

### Query or ACL failures

Check your `DBS_*`, `PRIVATE`, and `PUBLIC` values. These are consumed directly by the XYZ backend modules.

## Related docs

- `README.md`: project overview
- `DEVELOPING.md`: contributor workflow details
- `TESTING.md`: test structure and commands
- `DOCUMENTATION.md`: JSDoc and documentation notes
