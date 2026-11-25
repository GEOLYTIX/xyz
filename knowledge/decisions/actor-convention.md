---
type: Decision
title: Actor convention
description: Who is recorded in generated and verified, and when a concept may become stable; use before recording provenance or reviewing content.
tags: [documentation, okf, provenance, review]
status: draft
sources:
  - resource: https://github.com/GEOLYTIX/xyz/issues/3007
  - resource: https://github.com/open-knowledge-format/open-knowledge-format/blob/527e81aff55992be21507e97004286789126f88c/SPEC.md
  - resource: ../../utils/knowledge/validate.mjs
---
# Actor convention

OKF v0.3 records who wrote a concept in `generated` and who confirmed it in
`verified`, with one actor convention (§7). A consumer derives a trust tier
from the verifications at or after `generated.at`: unverified,
machine-confirmed, or human-reviewed, which only a `human:` actor gives
(§5.3). XYZ uses these fields as follows.

## Actors

| Actor | Used for |
| --- | --- |
| `human:<github-handle>` | A maintainer who wrote the content, or read it against its sources and confirmed it |
| `<tool>/<model>`, eg. `claude-code/claude-opus-5-5` | An agent which wrote the content, in `generated` only |
| `process:knowledge-examples` | Reserved; not recorded. See below |

The GitHub handle identifies the reviewer in the pull request history. An
agent never appears in `verified`: an agent which wrote or checked content
under a maintainer's direction does not confirm it.

## Recording

- `generated` is optional. When recorded, `by` is the actor which wrote the
  content and `at` the time of the last meaningful change. Format, whitespace
  and link repairs do not move `at`.
- Migrated concepts record no `generated`: the Wiki authorship is in its
  revision history, linked through `x-xyz-revision`.
- `verified` records an actual content review: the maintainer read the
  concept against the code and tests it links. Add the event with the time of
  that review, eg. `verified: [{ by: "human:dbauszus-glx", at:
  "2026-12-01T10:00:00Z" }]`, and set `status: stable` in the same change.
- A concept stays `draft` until a current `human:` verification exists. The
  checker fails on `status: stable` without one, so rewriting a reviewed
  concept (moving `generated.at`) requires a new review or `draft`.

## No process verification

`verified` records maintainer reviews only; no automated check writes an
event. The issue outline proposed `process:knowledge-check` for CI
confirmations, but `pnpm knowledge:check` confirms that a concept is well
formed and its sources exist, not that its statements hold.

`pnpm knowledge:examples` comes closest: it runs the example of each
workspace concept against the testhost and devdb. That proves the XYZ API
accepts the example and its queries return rows, not that the prose is
right. The actor `process:knowledge-examples` is reserved for it, but not
recorded, because:

- a release workflow writing events would commit to `knowledge/` and touch
  the frontmatter of every workspace concept on each release;
- migrated concepts have no `generated.at`, so an old event would stay
  current after the prose changes;
- consumers read the machine-confirmed tier as the concept being confirmed,
  which overclaims what an example run shows.

The examples still fail CI when they break. A portal badge computed at build
time, or events with a content hash, can be added later without changing
this convention. See [knowledge checks](../workflows/checks.md).
