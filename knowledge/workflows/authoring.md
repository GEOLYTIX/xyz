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

## Provenance and review

Record each migrated Wiki URL and its Git revision in `sources`. Record current
implementation and relevant tests separately. `revision` is a local extension
for preserving the Wiki snapshot; it is not a replacement for OKF timestamps.

If recording generation, use `generated: { by, at }` with a truthful actor and
timestamp. Add `verified` only for an actual content check, with the actor and
time of that check. A format/link check alone does not verify runtime claims.

## Checks and limits

The checker parses YAML and Markdown, checks required type and reserved file
rules, validates log dates, and fails on missing local link and source targets.
Unknown types and metadata are accepted. Missing descriptions, missing directory
indexes, malformed optional metadata and expired `stale_after` values warn.

External URLs, heading anchors, raw HTML links, full workspace schemas and
environment-variable coverage are not checked by this first version. Source
paths existing on disk does not mean their behavior still matches the prose.
Review both when code changes. See [migration inventory](wiki-migration.md).
