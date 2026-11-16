---
type: Decision
title: OKF foundation
description: Establish a small source-linked knowledge bundle alongside existing documentation.
tags: [documentation, okf]
status: draft
sources:
  - resource: https://github.com/GEOLYTIX/xyz/issues/3007
  - resource: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md
  - resource: ../../DOCUMENTATION.md
---
# OKF foundation

Use `knowledge/` for OKF v0.2 concepts and directory indexes. Keep `docs/` as
generated JSDoc output. Keep root setup and development guides in place during
this migration. Link to source JSDoc rather than copying API signatures into
knowledge pages.

The first PR includes three representative Wiki adaptations, source and link
checks, and agent navigation. Portal generation, JSDoc JSON exports, Wiki
publishing, complete environment coverage and workspace schema validation remain
follow-up work on issue #3007. The Wiki is not yet a generated mirror.

## Paths and types

Follow OKF path semantics: `/` refers to the bundle root, not the repository
root. From a concept one directory below `knowledge/`, use `../../apps/...`
for repository source files. Relative links also work when browsing on GitHub.

Use the issue's suggested vocabulary where applicable: `Environment Variable`,
`Workspace Key`, `Template`, `Guide`, `Decision`, `Plugin`. OKF permits additional
types, so the validator accepts unknown nonempty type strings.

## Validation boundary

Missing or invalid concept frontmatter and an empty or non-string `type` are
format errors. XYZ additionally fails on broken local Markdown links and missing
local resource/source paths to catch moved code. These stricter checks are
repository authoring policy, not a claim that broken links invalidate OKF.
Optional quality signals are warnings. External URLs and anchor fragments are
not fetched or checked. Passing validation does not establish content accuracy.
