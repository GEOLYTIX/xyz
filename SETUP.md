# Setup And Run Guide

## What this repository contains

This repository is a `pnpm` monorepo workspace with three apps:

- `apps/xyz`: the core XYZ API and Express server logic
- `apps/mapp`: the MAPP frontend library bundle
- `apps/saml`: optional SAML routes mounted by the SAML dev server

The repository root wires those packages together and exposes the commands you will usually run during local development.
For app-specific usage, see each app README:

- [XYZ app](./apps/xyz/README.md)
- [MAPP app](./apps/mapp/README.md)
- [SAML app](./apps/saml/README.md)

## Prerequisites

Install these tools before you start:

- `git`
- `node`: 22+
- `pnpm`: 10+

Check your versions:

```bash
node --version
pnpm --version
```

## Clone and install

Use `git clone https://github.com/GEOLYTIX/xyz.git` to clone the repository into a new directory `xyz`.

Change into the directory and use `pnpm install` to install any monorepo dependencies defined or referenced in the package.json

## launch.json [VSCode]

After the dependencies are installed on local the process can be launched in debug through the VSCode interface. A new node launch.json can be created through the debug interface panel.

The Express server app `apps/xyz/server.js` must be referenced as program to launch. This allows to provide environment variables as env object, eg. to define the test WORKSPACE in the public folder.

```json
{
    "type": "node",
    "request": "launch",
    "name": "Launch Program (no Varlock, no .env)",
    "skipFiles": [
        "<node_internals>/**"
    ],
    "program": "apps/xyz/server.js",
    "env": {
        "WORKSPACE": "file:./public/workspace.json"
    }
},
```

Alternatively it is possible to define a launch block which recognises a .env file in the root. The command uses pnpm to execute the dev script [`varlock run -- node --inspect server.js`] defined in the package.json of the xyz app.

```json
{
    "type": "node-terminal",
    "request": "launch",
    "name": "Launch via Varlock (.env recognized)",
    "command": "pnpm --filter @geolytix/xyz-app dev",
    "cwd": "${workspaceFolder}"
}
```

## Environment variables
The node process which runs the xyz express app can be configured with environment variables in an env file in the repository root.

For a minimum configuration the workspace.json with a single OSM tile layer can be used:

```
WORKSPACE=file:./public/workspace.json
```

### Optional variables

- `TITLE`: used in rendered views and cookie naming.
- `SECRET`: used to sign JWTs and auth cookies.
- `DIR`: serve the app from a base path such as `/xyz`
- `PRIVATE`: require authentication for all requests using an ACL connection
- `PUBLIC`: enable optional authentication using an ACL connection
- `DBS_*`: database connection strings used by query/provider modules
- `CUSTOM_TEMPLATES`: merge additional templates into the workspace cache
- `SECRET_KEY`: path to a key file if you want the app to load the signing secret from disk instead of `.env`
- `TRANSPORT_EMAIL`, `TRANSPORT_PASSWORD`, `TRANSPORT_PORT`, `TRANSPORT_TLS`: email transport configuration
- `SAML_*`: SAML identity provider and certificate settings for the optional SAML flow

### Varlock

Please refer to the [varlock documentation](./varlock/README.md) for schema validation and protection of sensitive environment variables.

## Start the application

For the standard local server:

```bash
pnpm dev
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
- `/api/workspace/locale`: resolved workspace payload
- `/public/js/lib/mapp.js`: bundled MAPP library asset

The sample `public/workspace.json` includes a minimal OpenStreetMap layer, which is enough for a basic local smoke test.

## Build commands
The repo uses Turborepo for workspace tasks.

Run all builds:

```bash
pnpm build
```

For MAPP-specific build details, see [apps/mapp/README.md](./apps/mapp/README.md).

Build unminified MAPP bundles for browser debugging with:

```bash
NODE_ENV=DEVELOPMENT pnpm build --filter=@geolytix/mapp
```

For JSDoc generation, see [DOCUMENTATION.md](./DOCUMENTATION.md).

## Vercel deployment
Deployments to Vercel require environment variables to be frozen and encrypted with varlock before deploying.

Please refer to [DEPLOYMENT.md](./DEPLOYMENT.md) for the full deployment workflow, and to the [varlock documentation](./varlock/README.md) for schema and secret configuration.

## Tests
Please refer to [TESTING.md](./TESTING.md) in regards to testing the individual XYZ monorepo apps.

## Database-backed setups
You only need a database if your workspace templates, ACL flow, or provider/query configuration depend on one.

In that case, define one or more `DBS_*` environment variables and point your workspace/query templates at those connections.

Typical examples:

```env
DBS_MAIN=postgres://user:password@localhost:5432/my_database
PRIVATE=localhost:5432|user:password|acl_table
```

Use the exact connection and ACL values required by your workspace and auth setup.

## SAML authentication
Please refer to [apps/saml/README.md](./apps/saml/README.md) in regards to authenticating users with SAML.

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
