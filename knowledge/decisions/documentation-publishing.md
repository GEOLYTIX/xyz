---
type: Decision
title: Documentation publishing
description: The VitePress knowledge portal is the published documentation, deployed on release and manually for corrections; the JSDoc site is retired and the Wiki keeps only stubs pointing to the portal.
tags: [documentation, okf, portal, wiki, release]
status: draft
resource: ../../.github/workflows/deploy-docs.yml
sources:
  - resource: https://github.com/GEOLYTIX/xyz/issues/3007
  - resource: ../../utils/knowledge/site/.vitepress/config.mjs
  - resource: ../../utils/knowledge/wiki.mjs
  - resource: ../../DOCUMENTATION.md
---
# Documentation publishing

The knowledge bundle is the source of truth, and the knowledge portal is its
only human-readable output. The portal renders `knowledge/` with VitePress and
is hosted on GitHub Pages at <https://geolytix.github.io/xyz/>.

## Why the portal

A generated Wiki and a VitePress portal were compared during the migration
(issue #3007, open question 7). Only one output ships, to avoid maintaining
two. The portal won because it keeps the bundle hierarchy in the sidebar,
searches all concepts offline, renders the OKF metadata with `draft` badges,
links source modules on GitHub at the built ref, and links each page to its
concept for editing. A generated Wiki needs a flat page namespace, its own
link rewriting and a generated sidebar, and its search is weak.

## On release and between releases

`release.yml` calls `deploy-docs.yml` with the release tag once it has
created the release, so a failed release publishes nothing and the portal is
built from the tagged commit. Source links and the footer name the tag; edit
links open the concept on `patch`.

A maintainer runs the workflow manually with a ref to publish a correction:
fix the concept in a pull request, then run the workflow for the release line
which carries the fix, eg. `patch`. The workflow accepts `main`, `minor`,
`patch`, an existing release tag, or the full SHA of a commit on `main`,
`minor` or `patch`, and fails on other refs, so a run cannot publish an
unmerged branch. It resolves the ref to a commit once and links sources at
that commit, so a branch moving while the run is queued
does not change the links. Do not build from a branch with
unreleased features, or the portal describes behaviour which no released
version has.

Pull requests are reviewed with a local build (`pnpm knowledge:site:build`,
`pnpm knowledge:site:preview`); they are not deployed. The knowledge check
workflow builds the portal on every pull request, so a dead link fails there
rather than on publishing. GitHub Pages is set up
after the migration is merged into `minor`, and a manual run with the `minor`
ref publishes the portal for evaluation before the v5.1 release.

## JSDoc

The JSDoc API reference site and its `clean-jsdoc-theme` build are retired;
the portal replaces them on GitHub Pages. JSDoc comments stay in the source
for signatures, parameters and return types, and the conventions in
DOCUMENTATION.md still apply.

## Wiki

The Wiki is not documentation any more. `pnpm knowledge:wiki <checkout>`
replaces its pages with a Home page pointing to the portal, an Open Knowledge
Format page generated from [about this bundle](../about.md), and a stub per
former page from the [migration inventory](../workflows/wiki-migration.md), so
that old links lead to the portal. The hand-written pages remain in the Wiki's
Git history.
