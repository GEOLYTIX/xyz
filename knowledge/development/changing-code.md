---
type: Guide
title: Changing the codebase
description: How to plan and land a change across XYZ, MAPP and MAPP.UI - where a change belongs, the app boundaries, the order of a cross-app change, which tests and docs to update, and the branch model; use before starting a code change. Commands are in DEVELOPING.md and TESTING.md.
tags: [development, workflow, testing, review]
status: draft
sources:
  - id: developing
    resource: ../../DEVELOPING.md
  - id: testing
    resource: ../../TESTING.md
  - id: releasing
    resource: ../../RELEASING.md
  - id: contributing
    resource: ../../CONTRIBUTING.md
  - id: review
    resource: ../../.claude/skills/review-pr/SKILL.md
  - id: ci
    resource: ../../.github/workflows/biome.yml
  - resource: ../../AGENTS.md
  - resource: ../../varlock/README.md
  - resource: ../../packages/testhost/README.md
---
# Changing the codebase

[DEVELOPING.md](../../DEVELOPING.md) has the setup and Biome commands,
[TESTING.md](../../TESTING.md) the test commands and conventions, and
[CONTRIBUTING.md](../../CONTRIBUTING.md) the pull request rules. This guide
covers what they leave out: deciding where a change goes and what else must
change with it.

## 1. Find the concept

Run `pnpm knowledge:find <term>` for the key, variable or module, and read the
concept before the code. A concept's `resource` and `sources` list the
modules and tests to read next. The bundle is incomplete; no concept does
not mean no feature.

## 2. Decide where the change belongs

Prefer the smallest layer which can do the job:

1. **Workspace configuration.** Many requests are a layer, template or role
   change, not code. See the [workspace concepts](../workspace/index.md).
2. **A workspace query template or a plugin.** Deployment-specific SQL goes
   into `workspace.templates`; deployment-specific UI into a plugin loaded
   with `locale.plugins`.
3. **Core code**, when every deployment needs it:
   - Data access, auth, workspace composition: [XYZ API](../architecture/xyz-api.md).
   - Map, layers, locations, formats, styles: MAPP in `apps/mapp/lib`; see
     [MAPP and MAPP.UI](../architecture/mapp.md).
   - Panels, entries, controls, buttons: [MAPP.UI](../architecture/mapp-ui.md).

## 3. Respect the boundaries

- MAPP must not reference `mapp.ui` or import from `apps/ui`; CI fails if it
  does.[^ci] If MAPP needs a ui behaviour, give it a plain default which the
  ui replaces, like `mapp.layer.drawLegend`.
- MAPP.UI uses MAPP only through the `mapp` global.
- MAPP talks to XYZ only over HTTP. The client sends template and layer keys
  and params; SQL, connections and roles stay in the workspace.
- XYZ modules read configuration from `globalThis.xyzEnv`. A new variable is
  added in `processEnv.js`, the Varlock schema ([varlock/README.md](../../varlock/README.md))
  and an [environment concept](../environment/index.md).

## 4. Order a cross-app change

A feature which spans the apps is built from the server out:

1. XYZ: the query template, endpoint or param, with its tests in `apps/xyz/tests`.
2. MAPP: the library code which requests it, tested against the testhost.
3. MAPP.UI: the interface, with module tests and, for a user flow, a
   default view test.

The three ship in one release, and MAPP is used with an XYZ of the same minor
version. A change to a request param or workspace key is a breaking change
for older clients and workspaces; keep the old form working and warn, or
target the next major.

## 5. Try it

- `pnpm testview` serves the MAPP source modules with a local XYZ and the
  devdb, without a build; see the [testhost](../../packages/testhost/README.md).
- Test workspaces live in `packages/testhost/workspaces` and the app test
  directories. Add a view or workspace there for a new feature rather than
  relying on a private deployment.
- For the full default view, build the bundles and run `pnpm dev`. Don't
  commit the bundles; see [Monorepo](../architecture/monorepo.md#build-outputs).

## 6. Test

- Add or change the test file which mirrors the module path. A bug fix comes
  with a test which fails before the fix.[^review]
- Run the suite of each app you touched: `pnpm test:xyz`, `pnpm test:mapp`,
  `pnpm test:ui`, and the coverage variants to see the touched files.
- A turbo run which prints `FULL TURBO` replayed a cache and ran nothing;
  rerun with `--force` before reporting a pass.[^review]

## 7. Document

- Signatures, params and return types go into JSDoc; see
  [Clean code guidelines](clean-code.md#jsdoc).
- A behaviour change updates its concept and source links in the same pull
  request, following the [authoring workflow](../workflows/authoring.md).
  Run `pnpm knowledge:check`.
- `apps/mapp/README.md` is the npm page; keep its usage sections in step with
  the [package concept](../architecture/mapp-package.md).

## 8. Open the pull request

- Open or reference an issue first, keep one concern per pull request, and
  keep commits small, without merge commits.[^contributing]
- Target the development branch for the release: `patch`, `minor` or
  `major`. `main` only receives releases; see [RELEASING.md](../../RELEASING.md).[^releasing]
- The `review-pr` skill in `.claude/skills` checks a branch for whole-method
  correctness, repeated listener registration, scope, tests and JSDoc.

[^ci]: .github/workflows/biome.yml
[^review]: .claude/skills/review-pr/SKILL.md
[^contributing]: CONTRIBUTING.md
[^releasing]: RELEASING.md
