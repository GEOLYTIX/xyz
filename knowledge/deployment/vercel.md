---
type: Guide
title: Deploy to Vercel
description: How the Express app runs as a Vercel function, what a deployment ships, and how to deploy, check, roll back and deploy the auth and SAML apps; use before any Vercel deployment.
tags: [deployment, vercel, serverless]
status: draft
resource: ../../vercel.json
sources:
  - id: deployment
    resource: ../../DEPLOYMENT.md
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/VERCEL
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: vercel-json
    resource: ../../vercel.json
  - id: vercelignore
    resource: ../../.vercelignore
  - id: server
    resource: ../../apps/xyz/server.js
  - id: process-env
    resource: ../../apps/xyz/mod/utils/processEnv.js
  - id: deploy
    resource: ../../utils/deploy-vercel.js
  - resource: ../../apps/auth/vercel.json
  - resource: ../../apps/saml/vercel.json
---
# Deploy to Vercel

Vercel is the primary deployment target. The Express app runs as one Node
serverless function. Configure its environment as described in
[Vercel environment](vercel-environment.md); for other hosts see
[Node host](node-host.md).[^deployment]

## Prerequisites

- Node 22+ and the pnpm version of the root `packageManager`.
- The Vercel CLI, installed globally; it is not a repository dependency:
  `npm install --global vercel` or `pnpm add -g vercel`.
- `vercel login`, and a project linked with `vercel link`, which writes the
  gitignored `.vercel/project.json`. A free Hobby account works; XYZ needs no
  framework preset, so the project defaults can be kept.[^wiki]

## How it is wired

The root `vercel.json` builds `apps/xyz/server.js` with `@vercel/node`, ships
`.varlock.blob`, `public/**` and `resources/**` through `includeFiles`, and
routes `/(.*)` to the function.[^vercel-json] The v4 `api/api.js` entry and
the per-endpoint rewrites are gone.

- **No build command runs on Vercel.** The MAPP bundles in `public/js/lib`,
  `public/css/mapp.css` and `public/css/ui.css` upload from the local working
  tree. They are gitignored on the development branches, so build them first
  unless deploying from `main` or a release tag, see
  [release builds](release-builds.md). The Wiki said the bundles are
  committed and that the build clears `public/js/lib`; neither holds now.
- `server.js` skips `app.listen()` when `VERCEL` is set and exports the app
  for `@vercel/node`.[^server]
- `DIR` prefixes every route; the catch-all route needs no change.

## What ships

`@vercel/node` traces imports from `apps/xyz/server.js`. A file read from disk
at runtime must be in `includeFiles`. `.vercelignore` excludes `.env*`,
`*.md`, `apps/mapp`, `apps/ui`, `apps/xyz/tests`, `packages/devdb` and
`packages/testhost`, so pnpm on Vercel never installs PGlite.[^vercelignore]

Runtime file reads resolve from `XYZ_CWD` or the repository root:

| Variable | File read |
|---|---|
| `SECRET_KEY` | the path set, unless the value is the PEM itself |
| `SIGN_<KEY>` | `<KEY>.pem` |
| `KEY_CLOUDFRONT` | the matching `*.pem` |
| `FILE_RESOURCES` (default `resources`) | resource files, not publicly served |
| `WORKSPACE=file:...` | the workspace JSON |

`*.pem` files are gitignored and upload from the working copy; add them to
`includeFiles` when `SECRET_KEY`, `SIGN_*` or `KEY_CLOUDFRONT` use one. A
`SECRET_KEY` value starting with `-----BEGIN` is the key itself, eg. from a
secret manager, and needs no file.[^process-env]

## Deploy

```bash
pnpm deploy:vercel --env=production   # build, rotate key, freeze blob, deploy
pnpm deploy:vercel --env=preview
vercel --prod                         # without a blob, after a build
vercel --target=preview
```

`utils/deploy-vercel.js` builds the bundles, generates a key, freezes
`.varlock.blob`, stores `_VARLOCK_ENV_KEY` in the target environment, then
deploys.[^deploy] Details and the other configuration options are in
[Vercel environment](vercel-environment.md).

Each deployment gets its own URL; the project domain is on the Overview tab.
`.vercel/project.json` links the folder to one project; run `vercel link`
again, or remove `.vercel`, to deploy to another project.

## Check, roll back, promote

```bash
vercel ls
vercel inspect <deployment-url>
vercel logs <deployment-url> --follow
vercel rollback                    # previous production deployment
vercel promote <deployment-url>    # promote a validated preview
```

Smoke routes: `/`, `/api/workspace/locale` and `/public/js/lib/mapp.js`,
prefixed with `DIR`. `promote` re-points the production alias without a
rebuild. Each deployment carries its own blob and key, so a key rotation does
not break older deployments. Confirm a rollback serves traffic in the logs.

## The auth and SAML apps

`apps/auth` and `apps/saml` import the XYZ app and mount more routes. Their
`vercel.json` paths are relative to the repository root, so deploy from the
root:

```bash
pnpm build --filter=@geolytix/mapp --filter=@geolytix/mapp-ui
vercel --prod --local-config=apps/saml/vercel.json
```

Deploy each to its own Vercel project; every config claims `/(.*)`. The SAML
config ships `apps/xyz/*.crt` and `apps/xyz/*.pem`, which are gitignored and
must be present locally.

## Headers

Response headers, eg. `Cache-Control` and a `Content-Security-Policy`, go in a
`headers` array in `vercel.json`; the repository config has none. The browser
console reports resources a CSP blocks. Derive a policy from the sources a
workspace loads rather than copying the Wiki's GEOLYTIX header set.

## Continuous deployment

No workflow deploys the app, and Vercel Git integration deploys a checkout
without the bundles. Deploy with `pnpm deploy:vercel`, or from a workflow
which builds first, see [Vercel environment](vercel-environment.md#ci).

[^deployment]: DEPLOYMENT.md, folded into this and the linked concepts.
[^wiki]: Wiki VERCEL page.
[^vercel-json]: vercel.json.
[^vercelignore]: .vercelignore.
[^server]: apps/xyz/server.js.
[^process-env]: apps/xyz/mod/utils/processEnv.js `SECRET_KEY` handling.
[^deploy]: utils/deploy-vercel.js.
