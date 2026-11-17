---
type: Guide
title: Authoring and validation
description: Maintain small source-linked concepts with reviewable provenance and local checks.
tags: [documentation, workflow]
status: draft
sources:
  - resource: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md
  - resource: ../../utils/knowledge/validate.mjs
---
# Authoring and validation

1. Read the nearest index and relevant source code and tests. Add one concept per
   topic, with YAML frontmatter containing a nonempty `type` string.
2. Add `title`, `description`, `tags`, `status` and source references where useful.
   Keep new migrations `draft` until reviewed. Use unknown metadata fields only
   when their purpose is documented; existing unknown fields must be preserved.
3. Use relative Markdown links for navigation and repository source references.
   A leading `/` is relative to `knowledge/`. Source scope descriptions are legal
   OKF, but use explicit `./`, `../` or `/` prefixes for local metadata paths so
   the validator can distinguish them from descriptions.
4. Update the directory index and root log when adding or changing a topic.
   Only the root index may have frontmatter (`okf_version`); subdirectory indexes
   and logs have no frontmatter. Log date headings use `YYYY-MM-DD`, newest first.
5. Run `pnpm knowledge:check`. When changing validation, also run
   `pnpm knowledge:test`. These commands do not start the application or load
   deployment configuration.

## Environment Variable concepts

List the variables a concept documents in `variables`, an XYZ extension field.
Entries are exact names or a `PREFIX_*` family, eg. `variables: [OTEL_*]`.
Group variables that are configured together into one concept, and link the
module that reads them as `resource` with its tests in `sources`.

## Provenance and review

Record each migrated Wiki URL and its Git revision in `sources`. Record current
implementation and relevant tests separately. `revision` is a local extension
for preserving the Wiki snapshot; it is not a replacement for OKF timestamps.

If recording generation, use `generated: { by, at }` with a truthful actor and
timestamp. Add `verified` only for an actual content check, with the actor and
time of that check. A format/link check alone does not verify runtime claims.

## Checks and limits

The checker fails on:

- missing or malformed frontmatter, or a missing `type`
- a root index without `okf_version: '0.2'`, and frontmatter in other indexes or logs
- log dates which are invalid or not newest first
- missing local link and source targets, and paths escaping the repository
- path-like `resource` values without a `./`, `../` or `/` prefix

It warns on:

- missing titles and descriptions, and malformed optional metadata
- expired `stale_after` dates
- a directory without an index, and a concept or subdirectory its index omits
- environment variables read by the XYZ API (`apps/xyz/mod`, `router.js`,
  `apps/saml`) which no concept lists in `variables`. Platform variables such as
  `VERCEL_*` and `NODE_ENV` are ignored.

Unknown types and metadata are accepted. External URLs, heading anchors, raw
HTML links and workspace schemas are not checked. Source
paths existing on disk does not mean their behavior still matches the prose.
Review both when code changes. See [migration inventory](wiki-migration.md).
