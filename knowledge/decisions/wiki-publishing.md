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

## Not yet implemented

The generator and its workflow are phase 4 of the
[#3007 outline](https://github.com/GEOLYTIX/xyz/issues/3007). Until then the
existing Wiki stays as it is.
