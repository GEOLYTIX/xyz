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
until reviewed. Source code and tests resolve disagreements with prose. The
bundle is published as the [knowledge portal](https://geolytix.github.io/xyz/).

Look up a workspace key, environment variable or module with
`pnpm knowledge:find <term>`.

- [About this bundle](about.md) - The Open Knowledge Format, how the bundle is organised, and working through agents; read first.
- [Terminology](terminology.md) - The terms used across XYZ and MAPP, each linked to its concept.
- [Architecture](architecture/index.md) - The XYZ API, the MAPP and MAPP.UI libraries, the monorepo and the npm package; use before changing code.
- [Workspace](workspace/index.md) - Every workspace key with executable examples and a generated JSON Schema; use to write or review workspaces.
- [Views](views/index.md) - Application views and how to build custom views.
- [Plugins](plugins.md) - What MAPP plugins are and how to write one.
- [Security](security/index.md) - Security practices, user accounts, authentication and authorization.
- [Environment](environment/index.md) - Every environment variable of the XYZ API, grouped by feature.
- [Deployment](deployment/index.md) - Local setup, Codespaces, Vercel, Neon, Node hosts, release builds and npm publishing.
- [Development](development/index.md) - Changing code across the apps, code style and fork migration.
- [Workflows](workflows/index.md) - Authoring, validation and migration inventory.
- [Decisions](decisions/index.md) - Foundation scope and documentation ownership.
- [Change history](log.md) - Bundle updates.
