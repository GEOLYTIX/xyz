---
type: Guide
title: About this knowledge bundle
description: What the Open Knowledge Format is, how this bundle is organised, and how people develop XYZ/MAPP and create workspaces through agents; read this first.
tags: [documentation, okf, agents, workflow]
status: draft
sources:
  - id: okf
    resource: https://github.com/open-knowledge-format/open-knowledge-format/blob/527e81aff55992be21507e97004286789126f88c/SPEC.md
  - id: foundation
    resource: ./decisions/okf-foundation.md
  - resource: ../AGENTS.md
---
# About this knowledge bundle

`knowledge/` is the reference for how XYZ and MAPP work and how they are
configured. It replaces the hand-written Wiki, which is generated from it.

## Who writes what

Code and workspaces are written by agents. People decide what to build, and
review what the agents produce. Both need the same reference:

- **Agents** look facts up here before they change code or write a
  workspace: which keys exist, what they require, which modules and tests are
  involved, and which constraints apply.
- **Reviewers** read concepts to understand a feature, and read a concept's
  diff in a pull request to see which behaviour changed. A pull request that
  changes behaviour updates its concept.

Concepts record what code cannot tell: intent, rules, the flow across the ui,
mapp and XYZ apps, security constraints, pitfalls and decisions. Function
signatures stay in the source JSDoc.

## The Open Knowledge Format

The bundle follows the [Open Knowledge Format](https://github.com/open-knowledge-format/open-knowledge-format)
(OKF) v0.3.[^okf] OKF is plain Markdown with YAML frontmatter, readable on
GitHub without tools:

- One file per **concept**. Its frontmatter has a required `type`, plus
  `title`, `description`, `tags` and `status`.
- `resource` links the code a concept describes; `sources` lists where its
  content came from: modules, tests and the old Wiki page with its revision.
- Every directory has an `index.md` listing its concepts with a one-line
  description, so a reader opens only what is relevant. `log.md` records
  changes to the bundle.
- `status: draft` marks content which a maintainer has not yet reviewed.
- Keys starting `x-xyz-` are XYZ additions to OKF, described below.

## Concept types

| Type | Describes |
| --- | --- |
| `Feature` | How a feature works: Behaviour, Flow, Where to change, Tests, Pitfalls |
| `Workspace Key` | A group of workspace keys, with an executable example |
| `Environment Variable` | Variables configured together, eg. database connections |
| `Guide` | How to do something, like this page |
| `Decision` | Why something is the way it is |

## Workspace keys

Workspace concepts own the configuration keys. Each lists its keys in
`x-xyz-keys` with the key path, value type and, where known, the default, the
layer formats it applies to and the keys it requires. Each key is owned by
exactly one concept. A key path starts at the object it belongs to:
`workspace`, `locale`, `layer`, `style`, `theme`, `entry`, `dataview` or `filter`;
`*` stands for a named entry, eg. `locale.layers.*`, and `[]` for an array
item.

A JSON Schema generated from all keys,
[workspace.schema.json](workspace/workspace.schema.json), checks a workspace
for wrong value types and reports keys no concept documents.

Every workspace concept ends with a minimal JSON workspace under `# Examples`.
The examples use the devdb test database, so they run in tests and demos and
give agents a working starting point.

## Working with an agent

- **Create a workspace or view.** Describe the map you need: data, layers,
  filters, who may see what. The agent looks up the keys, starts from the
  concept examples, and validates the result. Review the workspace against
  the concepts it cites, especially roles and filters.
- **Change or debug a feature.** Point the agent at the feature. It reads the
  Feature concept, then the listed tests and modules, and updates the concept
  with the code. Review the concept diff first: it says what changed.
- **Look something up yourself.** `pnpm knowledge:find <term>` finds the
  concept for a workspace key (`layer.filter.default`), an environment
  variable (`DBS_*`), a source module (`apps/xyz/mod/query.js`) or a word.

## Checks

`pnpm knowledge:check` runs in CI. It fails on malformed concepts, missing
linked files, malformed `x-xyz-keys`, a key owned twice, an outdated schema,
and examples which are not valid against the schema. It warns on missing
descriptions, oversized concepts (over 150 lines), environment variables
without a concept and test workspace keys without a concept. `pnpm knowledge:examples`
runs every example against the devdb. A passing check means the
bundle is well formed, not that its content is correct; see the
[authoring workflow](workflows/authoring.md).

[^okf]: Open Knowledge Format specification v0.3
