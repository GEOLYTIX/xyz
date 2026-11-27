---
type: Decision
title: OKF foundation
description: Establish a small source-linked knowledge bundle alongside existing documentation.
tags: [documentation, okf]
status: draft
sources:
  - resource: https://github.com/GEOLYTIX/xyz/issues/3007
  - resource: https://github.com/open-knowledge-format/open-knowledge-format/blob/527e81aff55992be21507e97004286789126f88c/SPEC.md
  - resource: ../../DOCUMENTATION.md
---
# OKF foundation

Use `knowledge/` for OKF v0.3 concepts and directory indexes. `SETUP.md` and `DEPLOYMENT.md` move into the bundle
with pointers at the root; development guides stay at the root. Link to source
JSDoc rather than copying API signatures into knowledge pages.

## Release scope

The whole migration ships in one PR with the v5.1 minor release, following the
phased outline on issue #3007. The format ships with the release: bundle
structure, metadata schemas, the checker and workflows, and every Wiki page in
the bundle. Content accuracy is patched in v5.1 patch releases, and concepts
stay `draft` until reviewed. Every Wiki page must be in the bundle before the
release, because the Wiki is reduced to stubs which point to the knowledge
portal; see [documentation publishing](documentation-publishing.md).

The portal therefore ships with every concept `draft`: agent-written content
which no person has reviewed replaces the Wiki on release. This is accepted
deliberately, so that a content review does not hold back the format. Readers
should treat `draft` concepts as unreviewed. Concepts become `stable` one by
one after a person reviews them against the code, in v5.1 patch releases;
the [actor convention](actor-convention.md) records that review.

## Spec version

The bundle pins one OKF version in the root index and the checker rejects
others (open question 5 on #3007). It pins v0.3, released on 2026-11-18 and
recorded in `sources` at the spec revision checked. v0.3 moved the spec to the
`open-knowledge-format` organisation. Its breaking changes do not affect this
bundle: paths already resolved from the concept's directory, and no concept
records `verified`. The bundle adopts the v0.3 additions which apply: a root
`title` and `description`, and `x-xyz-` names for the XYZ extension keys
`x-xyz-variables` and `x-xyz-revision`. Moving to a later version is a
deliberate change to the pin, the checker and this record.

## Paths and types

Follow OKF path semantics: `/` refers to the bundle root, not the repository
root. From a concept one directory below `knowledge/`, use `../../apps/...`
for repository source files. Relative links also work when browsing on GitHub.

Use the issue's suggested vocabulary where applicable: `Environment Variable`,
`Workspace Key`, `Template`, `Guide`, `Decision`, `Plugin`. OKF permits additional
types, so the validator accepts unknown nonempty type strings.

## Validation boundary

Format errors fail. XYZ additionally fails on broken local links, missing local
resource paths and unprefixed path-like resources, to catch moved code. These
stricter checks are repository authoring policy, not a claim that they
invalidate OKF. The [authoring workflow](../workflows/authoring.md) lists the
checks. Passing validation does not establish content accuracy.

## Environment coverage

A variable read in code without a concept fails the check (open question 4 on
#3007). It warned until `knowledge/environment/` covered every variable; now a
new variable cannot land without a concept.

## Tests

The checker tests use Vitest like the application suites, but run with
`pnpm knowledge:test` and the knowledge workflow rather than turbo's
`pnpm test`, because the checker is repository tooling and not part of an app.
