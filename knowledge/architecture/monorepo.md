---
type: Guide
title: Monorepo
description: How the repository is split into apps and packages, how pnpm, the catalog and Turborepo tie them together, and where build outputs go; use before adding a package, a dependency or a build step.
resource: ../../pnpm-workspace.yaml
tags: [monorepo, pnpm, turbo, build, architecture]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Monorepo/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: workspace
    resource: ../../pnpm-workspace.yaml
  - id: turbo
    resource: ../../turbo.json
  - id: root
    resource: ../../package.json
  - id: optional
    resource: ../../apps/xyz/package.json
  - id: gitignore
    resource: ../../.gitignore
  - id: vercelignore
    resource: ../../.vercelignore
  - id: bump
    resource: ../../utils/bump-version.js
  - resource: ../../apps/mapp/turbo.json
  - resource: ../../apps/ui/turbo.json
  - resource: ../../apps/mapp/README.md
  - resource: ../../apps/ui/README.md
---
# Monorepo

Since v5 the repository is a pnpm workspace driven by Turborepo. The v4 flat
layout (`lib/`, `api/`, `mod/`, root `express.js`) is gone; see
[Migrating a v4 fork](../development/fork-migration.md).

## Layout

| Package | Directory | Role |
| --- | --- | --- |
| `@geolytix/xyz-app` | [apps/xyz](../../apps/xyz) | [XYZ API](xyz-api.md), router and server. |
| `@geolytix/mapp` | [apps/mapp](../../apps/mapp) | MAPP library; also the [npm package](mapp-package.md). |
| `@geolytix/mapp-ui` | [apps/ui](../../apps/ui) | [MAPP.UI](mapp-ui.md) library. |
| `@geolytix/xyz-auth-app` | [apps/auth](../../apps/auth) | Template for a custom authentication host. |
| `@geolytix/xyz-saml-app` | [apps/saml](../../apps/saml) | XYZ with the optional SAML routes. |
| `@geolytix/xyz-devdb` | [packages/devdb](../../packages/devdb) | In-memory PGlite PostGIS database for tests and examples. |
| `@geolytix/xyz-testhost` | [packages/testhost](../../packages/testhost) | Local XYZ host with the devdb, for browser tests and test views. |

Other root directories:

- `public/` holds the views, icons, dictionaries, css and the built bundles
  served by XYZ.
- `utils/` holds release, deploy and knowledge scripts, and the knowledge
  portal in `utils/knowledge/site/`.
- `varlock/` holds environment schemas, eg. the `vanilla` schema the XYZ
  tests run with.
- `knowledge/` is this bundle.

## pnpm workspace and catalog

[pnpm-workspace.yaml](../../pnpm-workspace.yaml) lists the packages. Every
third-party version is declared once in its `catalog:` section; a manifest
refers to it as `"catalog:"`. Local packages refer to each other as
`"workspace:*"`.[^workspace]

- Add or bump a dependency in the catalog, then reference it with `catalog:`.
- `allowBuilds` lists the packages allowed to run install scripts.
- Use the pnpm version in the root `packageManager` field.[^root]

## Dependencies

Each package declares the dependencies it uses; check its `package.json`
rather than a list here.

- XYZ (`apps/xyz`) needs Node.js 22 or later. Its runtime dependencies are
  express, `pg`, `bcrypt`, `jsonwebtoken` and varlock. The AWS SDK, `resend`
  and the OpenTelemetry exporters are `optionalDependencies`, imported
  dynamically only when the feature is configured.[^optional]
- `@node-saml/node-saml` is a dependency of `apps/saml` only, so a deployment
  without SAML does not install it.
- MAPP and MAPP.UI have no runtime dependencies. `ol` is a peer dependency of
  the [npm package](mapp-package.md), loaded as a global. µhtml is vendored as
  source in `apps/mapp/lib/utils/uhtml.mjs`, not installed.
- The devdb uses PGlite with PostGIS; the testhost adds express and `vt-pbf`.

Development dependencies are declared at the root or in the app that uses them:

| Tool | Declared in | Purpose |
| --- | --- | --- |
| turbo | root | Runs tasks across the packages. |
| Biome | root | Lint and format (`pnpm lint`). |
| Vite | mapp, ui | Builds the library bundles and css. |
| Vitest, Playwright | root, apps | Unit and browser tests; see [TESTING.md](../../TESTING.md). |
| publint | mapp | Checks the npm package. |
| VitePress, markdown-it, yaml | root | Knowledge portal and checks. |

## Turborepo

Run tasks from the root; [turbo.json](../../turbo.json) defines `build`,
`dev`, `test`, `test:coverage`, `lint` and `workspace:cache`.[^turbo]

- `build` depends on `^build`. The mapp and ui `turbo.json` files declare
  their outputs in `public/` and `dist/`, so turbo can restore them from cache.
- `test` depends on `transit`, which only follows the dependency graph: a
  change in a dependency invalidates the test cache without running builds.
- A cached run prints `FULL TURBO` and no test counts. Use `--force` to run
  the tests again.
- Each app has its own `vitest.config.mjs`; there is none at the root.
- Filter by package name, eg. `pnpm build --filter=@geolytix/mapp`.

The root scripts are the entry points: `pnpm dev`, `pnpm build`, `pnpm test`,
`pnpm test:xyz`, `pnpm test:mapp`, `pnpm test:ui`, `pnpm testview`, and the
`knowledge:*` scripts. See [DEVELOPING.md](../../DEVELOPING.md) and
[TESTING.md](../../TESTING.md).

## Build outputs

| Build | Output |
| --- | --- |
| `@geolytix/mapp` | `apps/mapp/dist/mapp.js`, `mapp.css` (npm package), copied to `public/js/lib` and `public/css` |
| `@geolytix/mapp-ui` | `public/js/lib/ui.js`, `public/css/ui.css` |
| XYZ | none; it runs from source |

- Both library builds write into `public/js/lib` without emptying it, so one
  build keeps the other's bundle. The mapp build empties `dist` first.
- The bundles are gitignored. The release workflow commits them to `main` and
  the release tag only, so a release checkout is deployable without a
  build.[^gitignore] Don't commit them on a development branch.
- [.vercelignore](../../.vercelignore) excludes the library sources, the XYZ
  tests, devdb and testhost from a Vercel deployment. A deployment of `main`
  or a release tag serves the committed bundles; a development branch must be
  built first.[^vercelignore] See
  [Release builds](../deployment/release-builds.md) for the release workflow.

## Versions

The XYZ version lives in the root `package.json` (with a `v`), the root
README, `apps/mapp/lib/mapp.mjs` and `apps/mapp/package.json`. The other app
manifests have no version. Change it with `pnpm bump:patch|minor|major`;
`utils/check-version.js` checks that all four match.[^bump] See
[RELEASING.md](../../RELEASING.md).

[^workspace]: pnpm-workspace.yaml
[^root]: package.json
[^optional]: apps/xyz/package.json
[^turbo]: turbo.json
[^gitignore]: .gitignore
[^vercelignore]: .vercelignore
[^bump]: utils/bump-version.js
