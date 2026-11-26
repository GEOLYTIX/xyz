---
type: Guide
title: Knowledge checks
description: What pnpm knowledge:check and knowledge:examples fail and warn on, and what they cannot check.
tags: [documentation, workflow, validation]
status: draft
resource: ../../utils/knowledge/validate.mjs
sources:
  - resource: ../../utils/knowledge/concepts.mjs
  - resource: ../../utils/knowledge/schema.mjs
  - resource: ../../utils/knowledge/examples.mjs
  - resource: ../../utils/knowledge/changed.mjs
  - resource: ../../utils/knowledge/validate.test.mjs
  - resource: ../../utils/knowledge/concepts.test.mjs
  - resource: ../../utils/knowledge/examples.test.mjs
---
# Knowledge checks

The checker fails on:

- missing or malformed frontmatter, or a missing `type` (OKF v0.3 skips such
  files with a warning; XYZ fails, since every file here is meant as a concept)
- a root index without `okf_version: "0.3"`, and frontmatter in other indexes or logs
- log dates which are invalid or not newest first
- missing local link and path field targets (`resource`, `sources[].resource`,
  `superseded_by`, `computation`, `executor.resource`, `attester.resource`,
  a bundle `license` path), and paths escaping the repository
- path-like path field values without a `./`, `../` or `/` prefix
- malformed `x-xyz-keys` entries, a workspace key owned by two concepts, a
  `requires` or `required` key which no concept owns, a `required` rule naming
  a key which is not a sibling, and a `formats` value which is not a key of
  the MAPP format registry (`apps/mapp/lib/layer/format/_format.mjs`)
- an `x-xyz-variables` value which is not a list of `NAME` or `PREFIX_*` strings
- a `json` code block under `Examples` which does not parse, or an example
  which fails the strict schema: a value of the wrong type, outside its
  `enum`, `pattern` or range, a missing required key, or a key no concept owns
- a workspace schema which is out of date with the concepts. The schema
  checks run even when other checks fail.
- malformed `generated` or `verified` frontmatter, an agent actor in
  `verified`, and `status: stable` without a `human:` verification at or after
  `generated.at`; see the [actor convention](../decisions/actor-convention.md)
- environment variables read by the XYZ API (`apps/xyz/mod`, `router.js`,
  `apps/saml`) which no concept lists in `x-xyz-variables`. Platform
  variables such as `VERCEL_*` and `NODE_ENV` are ignored.

It warns on:

- missing concept or bundle titles and descriptions, and malformed optional metadata
- `stale_after` values which are not an RFC 3339 date or date-time with offset,
  and expired `stale_after` dates
- a directory without an index, and a concept or subdirectory its index omits
- a concept over 150 lines, a Workspace Key concept without a JSON example,
  and a Feature concept missing one of its headings
- keys used in the repository test workspaces (`apps/mapp/tests/workspaces`,
  `apps/ui/tests/workspaces`, `packages/testhost/workspaces`,
  `public/workspace.json`) which no concept owns, and values of the wrong
  type in them. Template contents are not checked.

Unknown types and metadata are accepted. External URLs, heading anchors and raw
HTML links are not checked.

`pnpm knowledge:changed --base <ref>` compares a branch with its merge base:
it fails when a concept's `resource` changed but the concept did not, and
warns when a module in its `sources` changed. A directory resource covers the
files inside it. CI runs it on pull requests which do not target `main`, with
`--warn-only` when the pull request has the `knowledge-unaffected` label. The
label is for changes which leave every statement of the concept true;
`review-pr` checks that claim.

`pnpm knowledge:examples` runs every example in the testhost with the devdb:
each example must load as a locale, its `wkt` and `geojson` layers must return
rows, and each `filter.default` must return fewer rows than the same layer
without it. CI runs it in the knowledge workflow.

The examples are combined into one workspace, so the combiner composes the
`locale` defaults of an example into each of its named locales as XYZ does:
the defaults precede the template of a named locale, which precedes its own
properties. That template must be defined in the example. The layers of the
unfiltered twin set `filter.default` to `null`, which precedes a default filter
inherited from `locale.layer` or a layer `template`. An entry of a layer
`templates` array precedes the layer itself, so the combiner fails when a
layer inherits a default filter from one. Source
paths existing on disk does not mean their behavior still matches the prose.
Review both when code changes. See [migration inventory](wiki-migration.md)
and [authoring](authoring.md).
