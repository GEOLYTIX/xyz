---
okf_version: "0.3"
title: XYZ/MAPP knowledge
description: Architecture, environment, workspace configuration and documentation workflows for the XYZ API and MAPP library. Use it before changing or deploying XYZ/MAPP.
---
# XYZ/MAPP knowledge

The reference for how XYZ and MAPP work and are configured, for the agents
which write code and workspaces and the people who review them. The migration
from the Wiki is tracked in
[issue #3007](https://github.com/GEOLYTIX/xyz/issues/3007). Concepts are draft
until reviewed. Source code and tests resolve disagreements with prose.

Look up a workspace key, environment variable or module with
`pnpm knowledge:find <term>`.

- [About this bundle](about.md) - The Open Knowledge Format, how the bundle is organised, and working through agents; read first.
- [Architecture](architecture/index.md) - MAPP's role and library boundaries.
- [Environment](environment/index.md) - Environment variables grouped by feature: server, databases, workspace, redirects, token claims, telemetry.
- [Workspace](workspace/index.md) - Workspace keys with executable examples: layer filter, filter expressions, locales.
- [Workflows](workflows/index.md) - Authoring, validation and migration inventory.
- [Decisions](decisions/index.md) - Foundation scope and documentation ownership.
- [Change history](log.md) - Bundle updates.
