---
type: Guide
title: Running locally
description: Start the XYZ server locally with the dev scripts or a VS Code launch configuration, check the first run and troubleshoot a blank view.
tags: [deployment, development, vscode, varlock]
status: draft
resource: ../../apps/xyz/server.js
sources:
  - id: setup
    resource: ../../SETUP.md
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Getting-started/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: package
    resource: ../../package.json
  - id: router
    resource: ../../apps/xyz/router.js
  - id: server
    resource: ../../apps/xyz/server.js
---
# Running locally

Install, build and configure the environment first, see
[local development](local-development.md). This concept replaces the run
sections of SETUP.md.[^setup]

## Dev scripts

```bash
pnpm dev        # @geolytix/xyz-app through Varlock
pnpm dev:auth   # apps/auth
pnpm dev:saml   # apps/saml, see apps/saml/README.md
```

Each runs `varlock run -- node --inspect server.js` in its app through
Turborepo, so the root `.env` is read and a debugger can attach.[^package]

The server listens on [`PORT`](../environment/server.md), default 3000:
`http://localhost:3000/`, or `http://localhost:3000/xyz` with `DIR=/xyz`.
`server.js` skips `app.listen()` only when `VERCEL` is set.[^server]

`node apps/xyz/server.js` also starts the server, but reads no `.env`. The
environment must then come from the shell, the launch configuration or the
platform.[^wiki]

## VS Code launch configurations

A `node` launch of `apps/xyz/server.js` bypasses Varlock. Give it the
variables as `env`, or point `envFile` at the root `.env`. A `node-terminal`
launch runs the dev script, so Varlock reads `.env` and `.env.schema`:

```json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch with env",
      "program": "apps/xyz/server.js",
      "cwd": "${workspaceFolder}",
      "env": { "TITLE": "Hello OSM!", "WORKSPACE": "file:./public/workspace.json" }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Launch with .env",
      "program": "apps/xyz/server.js",
      "cwd": "${workspaceFolder}",
      "envFile": "${workspaceFolder}/.env"
    },
    {
      "type": "node-terminal",
      "request": "launch",
      "name": "Launch via Varlock",
      "command": "pnpm --filter @geolytix/xyz-app dev",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

`envFile` reads plain values only; `gsm()` references in `.env` resolve
through Varlock alone. The same `env` object can be added to `vercel.json`,
see [Vercel environment](vercel-environment.md).

## First run checks

- `/` shows the default view with the OSM layer of `public/workspace.json`.
- `/api/workspace/locale` returns the resolved locale.
- `/public/js/lib/mapp.js` returns the built bundle.

Prefix each path with `DIR` when it is set. Without a `WORKSPACE` the server
starts, but the view has no locale or layer to show.

## Troubleshooting

- **Startup or ESM errors:** check `node --version` is 22 or later.
- **Inconsistent install:** check `pnpm --version` matches the root
  `packageManager`, then `pnpm install` again.
- **Blank view:** check `.env` is in the root and the launch reads it,
  `WORKSPACE` points at a valid source, the bundles are built (`pnpm build`),
  the server runs on the expected `PORT`, and the path includes `DIR`.
- **Auth routes fail:** set `SECRET` or `SECRET_KEY`; tokens and cookies are
  signed with it.
- **Query or ACL failures:** check the `DBS_*`, `PRIVATE` and `PUBLIC` values,
  which the XYZ modules read directly.

[^setup]: SETUP.md, start, launch.json and troubleshooting sections.
[^wiki]: Wiki Getting-started page; `dotenv` is not imported since v5.
[^package]: Root package.json `dev`, `dev:auth` and `dev:saml` scripts.
[^server]: apps/xyz/server.js.
