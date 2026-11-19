---
type: Decision
title: Wiki publishing
description: The Wiki is generated from the knowledge bundle on release, and can be regenerated manually between releases to publish corrections.
tags: [documentation, okf, wiki, release]
status: draft
sources:
  - resource: https://github.com/GEOLYTIX/xyz/issues/3007
---
# Wiki publishing

The GitHub Wiki becomes generated output of `knowledge/`. It is not edited by
hand: every generation replaces the Wiki pages, so a manual edit is lost on the
next run.

## On release

The release workflow generates the Wiki from the release tag. The Wiki then
describes the released version, and the Wiki Home page names that version and
links back to `knowledge/` as the source.

## Between releases

A maintainer can also run the generation manually, eg. when a Wiki page turns
out to be inaccurate. A manual run keeps the Wiki in step with the repository:

1. Fix the concept in a pull request like any other knowledge change.
2. Run the generation for the ref which carries the fix.
3. The Wiki Home page names the ref and commit it was generated from, so a
   manual run is distinguishable from a release.

Generate from the release line which the fix is merged into, eg. the `patch`
branch, rather than from a branch with unreleased features. Otherwise the Wiki
describes behaviour which no released version has.

## First generation

The switch happens during review of the migration PR, before it is merged:

1. Archive the hand-written Wiki pages in the Wiki, so reviewers can compare
   them with the generated pages.
2. Generate the Wiki from the PR branch, and review the generated pages with
   the PR.
3. Remove the archive before the PR is merged into `minor`. The Wiki's own Git
   history keeps the hand-written pages.

GitHub only lists a `workflow_dispatch` workflow once it is on the default
branch, so the review generation cannot use the workflow. The generator is
therefore a script which a maintainer can also run locally against a Wiki
checkout; the workflows call the same script.

## Not yet implemented

The generator and its workflows are phase 4 of the
[#3007 outline](https://github.com/GEOLYTIX/xyz/issues/3007). Until the first
generation the existing Wiki stays as it is.
