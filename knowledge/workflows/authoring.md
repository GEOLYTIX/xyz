---
type: Guide
title: Authoring and validation
description: Maintain small source-linked concepts with reviewable provenance and local checks.
tags: [documentation, workflow]
status: draft
sources:
  - resource: https://github.com/open-knowledge-format/open-knowledge-format/blob/527e81aff55992be21507e97004286789126f88c/SPEC.md
  - resource: ../../utils/knowledge/validate.mjs
---
# Authoring and validation

1. Read the nearest index and relevant source code and tests. Add one concept per
   topic, with YAML frontmatter containing a nonempty `type` string.
2. Add `title`, `description`, `tags`, `status` and source references where useful.
   Keep new migrations `draft` until reviewed. Name XYZ metadata fields
   `x-xyz-<name>`, the OKF v0.3 extension key form, and document their purpose
   here. Existing unknown fields must be preserved.
3. Use relative Markdown links for navigation and repository source references.
   A leading `/` is relative to `knowledge/`; any other path resolves from the
   concept's directory, for links and metadata paths alike. Source scope descriptions are legal
   OKF, but use explicit `./`, `../` or `/` prefixes for local metadata paths so
   the validator can distinguish them from descriptions.
4. Update the directory index and root log when adding or changing a topic.
   Only the root index may have frontmatter: the bundle metadata `okf_version`,
   `title` and `description`. Subdirectory indexes and logs have no frontmatter. Log date headings use `YYYY-MM-DD`, newest first.
5. Run `pnpm knowledge:check`. `pnpm knowledge:find <term>` looks up the
   concepts for a workspace key, environment variable, module path or word.
   When changing validation, also run `pnpm knowledge:test`. These commands do not start the application or load
   deployment configuration.

Write for agents that look facts up and for people that review: record what
code cannot tell (intent, rules, cross-app flow, constraints, pitfalls), not
what the source already says. Keep a concept under 150 lines; split it by
topic when it grows. Index descriptions say when to use a concept. Footnotes
whose label is a `sources[].id` attribute individual claims.

## Workspace Key concepts

A concept owns a group of keys which are configured together, and lists them
in `x-xyz-keys`:

```yaml
x-xyz-keys:
  - { key: layer.filter.current, type: object, default: {} }
  - key: layer.filter.include
    type: array
    requires: [layer.infoj]
    formats: [wkt, mvt]   # only when the key is limited to some layer formats
```

- `key` (required) is a path from one of `workspace`, `locale`, `layer`,
  `style`, `theme`, `entry`, `dataview` or `filter`. `*` is a named map entry and `[]`
  an array item, eg. `locale.layers.*`, `layer.infoj[]`. Quote a path with
  `[]` or `*` inside `{ … }` flow mappings: `{ key: "layer.infoj[]", … }`.
- `type` (required) is one or a list of `string`, `number`, `integer`,
  `boolean`, `object` and `array`.
- `default`, `formats` and `requires` are filled in when known. `formats` are
  keys of the MAPP format registry; `requires` are keys a concept owns.
- `description` says what the key does, `enum` lists its only valid values,
  and `deprecated` is `true` or names the replacement key. They are generated
  into the schema, which rejects a value outside the `enum`.
- `ref` names the root whose keys the value has, eg.
  `{ key: locale.layers.*, type: object, ref: layer }`. For an array the
  items have them; a style category is `ref: style`.
- Each key has exactly one owner; the checker fails on a second.

`pnpm knowledge:schema` generates `knowledge/workspace/workspace.schema.json`
from all `x-xyz-keys`; commit it with the concepts. Agents and editors can
validate workspaces with it.

End the concept with `# Examples` and a complete, minimal JSON workspace in a
`json` code block. Use the devdb tables (`packages/devdb/seed`) and the
`DEVDB` connection, so tests and demos can run the example.

## Feature concepts

Use the headings Behaviour, Flow, Where to change, Tests and Pitfalls. Cite the
test proving each rule in Behaviour. List the modules in Flow in call order
across the ui, mapp and XYZ apps.

## Environment Variable concepts

List the variables a concept documents in `x-xyz-variables`, an XYZ extension
field. Entries are exact names or a `PREFIX_*` family, eg.
`x-xyz-variables: [OTEL_*]`.
Group variables that are configured together into one concept, and link the
module that reads them as `resource` with its tests in `sources`.

## Provenance and review

Record each migrated Wiki page in `sources` as `…/wiki/<Page>/<revision>` (the
bare page URL shows the generated stub) with the revision in `x-xyz-revision`,
an XYZ extension which does not replace OKF timestamps. Record current
implementation and relevant tests separately.

If recording generation, use `generated: { by, at }` with a truthful actor and
timestamp. Add `verified` only for an actual content check, with the actor and
time of that check. A format/link check alone does not verify runtime claims.
Quote timestamps and actors, eg. `{ by: "human:<github-handle>", at:
"2026-11-18T09:00:00Z" }`. Under OKF v0.3 a verification earlier than
`generated.at` no longer counts, so rewriting reviewed content drops it from
human-reviewed until it is checked again.

## Checks

`pnpm knowledge:check` fails on malformed concepts and metadata, broken local
links and source paths, and environment variables without a concept. See
[knowledge checks](checks.md) for every rule and what is not checked.

## Publishing

The bundle is published as the [knowledge portal](https://geolytix.github.io/xyz/);
see [documentation publishing](../decisions/documentation-publishing.md). The
sidebar follows the directory indexes. Preview a change with
`pnpm knowledge:site:dev`; `pnpm knowledge:site:build` fails on dead links.
