---
type: Guide
title: Agent baseline
description: The agent tasks measured on minor without the knowledge bundle, their results, and how to repeat them after the release for comparison.
tags: [agents, measurement, workflow]
status: draft
resource: ../../utils/knowledge/baseline/tasks.json
sources:
  - resource: ../../utils/knowledge/baseline/2026-11-25
  - resource: https://github.com/GEOLYTIX/xyz/issues/3007
---
# Agent baseline

Phase 6 of #3007 measures whether the bundle makes agents more effective. The
baseline was recorded before the bundle reached `minor`, so no agent had it.

## Method

- Ref: `minor` at `8276a47f2`, which has no `knowledge/`, `AGENTS.md` or
  generated schema. One isolated checkout per task, dependencies installed.
- Agent: Claude Code general-purpose subagent on Claude Opus 5.5
  (`claude-opus-5-5`), one fresh agent per task, run in parallel on
  2026-11-25.
- Prompts: [tasks.json](../../utils/knowledge/baseline/tasks.json), sent as
  header, task, rules and report. The agents' outputs are kept in
  [2026-11-25](../../utils/knowledge/baseline/2026-11-25).
- Measured: tokens, tool calls and time as reported by the harness; files
  opened as reported by the agent; the result scored by a maintainer against
  the task's `check`, and workspaces against the generated
  [workspace schema](../workspace/workspace.schema.json).

## Results

| Task | Result | Tokens | Tools | Time | Files |
| --- | --- | ---: | ---: | ---: | ---: |
| t1 graduated theme | Done; rendered in a headless browser | 92,864 | 26 | 190 s | ~26 |
| t2 role restriction | Done; restriction checked against the query module | 99,951 | 32 | 224 s | ~32 |
| t3 editable location | Done; API round trip, UI not checked | 83,609 | 24 | 196 s | ~25 |
| t4 viewport dataview | Partial: the table does not render | 125,772 | 30 | 237 s | ~38 |
| t5 deployment lookup | Correct | 75,295 | 8 | 81 s | 14 |
| t6 RETRY_LIMIT | Done; the test fails without the fix | 60,287 | 10 | 86 s | 6 |
| t7 jwtClaims JSDoc | Done; JSDoc only | 69,110 | 15 | 147 s | ~16 |

Every workspace is valid against the schema without type errors. The
workspace tasks cost the most, reading the devdb seeds, testhost workspaces,
test locales and library source to find which keys exist:

- t4 did not find that a `table` dataview needs the tabulator plugin from
  the [public plugins](https://github.com/GEOLYTIX/mapp/tree/main/plugins),
  which the [dataviews](../workspace/dataviews.md) concept states. Its `table` keys are Tabulator options, which the schema does not
  describe.
- t2 found the two rules the [roles](../workspace/roles.md) concept states,
  `filter.default` and `"*": true`, only by reading `composeObj.js` and
  `query.js`.
- t3 read "redraw" as modifying the geometry (`edit: true`) and named drawing
  anew (`edit.draw`) as the alternative.
- t6 and t7 found nothing to update besides the code; the issues are
  [#3156](https://github.com/GEOLYTIX/xyz/issues/3156) and
  [#3155](https://github.com/GEOLYTIX/xyz/issues/3155). With the bundle the
  [databases](../environment/databases.md) and
  [JWT claims](../environment/jwt-claims.md) concepts would change too.

## Repeating the measurement

After the release, run the same prompts on the release tag, which has the
bundle and `AGENTS.md`, with the same model and agent type. Compare result,
tokens, tool calls, time, files opened and the corrections a maintainer needs.
Record the run next to this one, eg. `utils/knowledge/baseline/<date>/`, and
add a column here rather than replacing the baseline. The follow-up work is
tracked in [#3157](https://github.com/GEOLYTIX/xyz/issues/3157).
