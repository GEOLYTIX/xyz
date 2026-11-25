---
type: Guide
title: Release builds and build artefacts
description: Where the MAPP and MAPP.UI bundles are built and committed, how Turborepo caches them, debug and version-stamped builds, the pre-cached workspace and the CI workflows; use before deploying a branch or changing the build.
tags: [deployment, build, release, turbo, ci]
status: draft
resource: ../../turbo.json
sources:
  - id: deployment
    resource: ../../DEPLOYMENT.md
  - id: setup
    resource: ../../SETUP.md
  - id: releasing
    resource: ../../RELEASING.md
  - id: release
    resource: ../../.github/workflows/release.yml
  - id: turbo
    resource: ../../apps/mapp/turbo.json
  - resource: ../../apps/ui/turbo.json
  - id: copy
    resource: ../../apps/mapp/scripts/copyPublic.mjs
  - id: ui-vite
    resource: ../../apps/ui/vite.config.mjs
  - id: version
    resource: ../../utils/version.js
  - id: cache
    resource: ../../apps/xyz/utils/cache-workspace.js
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/VERCEL/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
---
# Release builds and build artefacts

## The bundles

The [monorepo build outputs](../architecture/monorepo.md#build-outputs) list
the files: MAPP builds the npm package into `apps/mapp/dist` and copies
`mapp.js`, its source map and `mapp.css` into `public`; MAPP.UI writes
`ui.js` and `ui.css` into `public` directly.

The MAPP build ends with `scripts/copyPublic.mjs`, which copies the bundle
from `dist` into `public`.[^copy] The UI build writes to `public/js/lib`
without emptying it, so each build keeps the other's bundle.[^ui-vite]

```bash
pnpm build                                                  # all packages
pnpm build --filter=@geolytix/mapp --filter=@geolytix/mapp-ui
```

`--filter=@geolytix/mapp` alone does not build MAPP.UI. The XYZ views load
both from `public`.

## Gitignored on development branches

The `public` bundles are gitignored, so they are not tracked on `patch`,
`minor` and `major` and changes to `apps/mapp` and `apps/ui` never conflict in
build output.[^deployment] Only `main` and the release tags carry them. A
checkout of either, or a source archive, is deployable without a build;
anything else must be built before it is [deployed](vercel.md) or
[run](running-locally.md).

The [release workflow](../../.github/workflows/release.yml) runs on every
push to `main`. For an untagged version it tests, builds the bundles with
`--force`, commits them in a `Build <tag>` commit, pushes `main` and the tag
atomically, creates the GitHub release from `release-notes/<tag>.md`, and
merges `main` into `patch` without the bundles. A push to `main` without the
bundles, eg. a squash merge, is rebuilt even when the tag exists.[^release]
The step-by-step release procedure is in [RELEASING.md](../../RELEASING.md).

## Turborepo cache

The `build` outputs of `apps/mapp/turbo.json` and `apps/ui/turbo.json` list
the `public` files and `dist`, so Turborepo restores them from its cache when
the sources are unchanged.[^turbo] Deleting `public/js/lib` and building
again is safe. Add `--force` to skip the cache, eg. for a stale frontend.

## Debug and stamped builds

```bash
NODE_ENV=DEVELOPMENT pnpm build --filter=@geolytix/mapp --filter=@geolytix/mapp-ui
node utils/version.js
```

`NODE_ENV=DEVELOPMENT` turns off minification for browser debugging; do not
deploy such a bundle. `utils/version.js` writes the current commit SHA as
`hash` into `apps/mapp/lib/mapp.mjs` and runs `pnpm build`, so a deployment
shows which framework commit it runs.[^version] It edits a tracked source
file; do not commit that change by accident.

## Pre-cached workspace

`pnpm workspace:cache` resolves the workspace through Varlock and inlines
every `src` response into one JSON, so a deployment does not fetch remote
templates on a cold start. It writes `apps/xyz/workspace.generated.json`, the
default `--output` relative to `apps/xyz`; run
`node ./utils/cache-workspace.js --help` from `apps/xyz` for `--workspace`
and `--output`.[^cache] Point [`WORKSPACE`](../environment/workspace.md) at
the file and make sure it ships. Module templates keep their `src` and are
read at runtime, since their render functions cannot be serialised.

## CI workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `biome.yml` | push, PR | `biome ci .`, and a check that `apps/mapp` does not reference MAPP.UI |
| `unit_tests.yml` | push, PR on `main`, `major`, `minor`, `patch` | `pnpm test` |
| `build.yml` | push on those branches, any PR | coverage and SonarQube, skipped for fork PRs |
| `knowledge-check.yml` | push, PR on those branches | `knowledge:test`, `knowledge:check`, `knowledge:examples`; on PRs not into `main`, `knowledge:changed` |
| `mapp_package.yml` | push on those branches, PRs touching the package | packs and tests `@geolytix/mapp`, see [MAPP package](mapp-publishing.md) |
| `publish_mapp.yml` | manual | publishes `@geolytix/mapp` to npm |
| `deploy-docs.yml` | push to `main`, manual with a ref | the knowledge portal to GitHub Pages, see [documentation publishing](../decisions/documentation-publishing.md) |
| `release.yml` | push to `main` | builds, tags and releases, see above |

No workflow deploys the app. DEPLOYMENT.md listed `build.yml` PRs as limited
to the release branches, and omitted the knowledge and MAPP package
workflows.

[^deployment]: DEPLOYMENT.md "Build artefacts" and "CI".
[^copy]: apps/mapp/scripts/copyPublic.mjs.
[^ui-vite]: apps/ui/vite.config.mjs `emptyOutDir: false`.
[^release]: .github/workflows/release.yml.
[^turbo]: apps/mapp/turbo.json and apps/ui/turbo.json; the root turbo.json lists no outputs.
[^version]: utils/version.js.
[^cache]: apps/xyz/utils/cache-workspace.js.
