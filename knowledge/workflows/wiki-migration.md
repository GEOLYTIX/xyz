---
type: Guide
title: Wiki migration inventory
description: Track the first three adaptations and the remaining migration scope.
tags: [documentation, migration]
status: draft
sources:
  - resource: https://github.com/GEOLYTIX/xyz/issues/3007
  - resource: https://github.com/GEOLYTIX/xyz/wiki
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
---
# Wiki migration inventory

Initial source snapshot: `xyz.wiki.git` at
`3fc379b7ada42dff57f19e9f28694868e5a17cac`. Implementation comparison:
`GEOLYTIX/xyz:minor` at `d2494dfff39285aeefca264cc206c5a886cb58f7`.
These are adaptations with corrections, not a verbatim archive. All require
maintainer content review.

| Wiki source | Destination | Coverage and corrections |
| --- | --- | --- |
| Process-Environment | [Workspace environment](../environment/workspace.md) | WORKSPACE and WORKSPACE_AGE only; current provider registry and cache behavior. |
| Workspace-Configuration | [Locales](../workspace/locales.md) | Default and named locales only; fallbacks, naming and authorization constraints. |
| MAPP | [MAPP architecture](../architecture/mapp.md) | Library overview; separate UI app, non-clearing builds, existing tests and explicit OpenLayers loading. |

The source snapshot has 20 pages. The other 17 remain unmigrated:
Application-Views, Clean-code-guidelines, Custom-Authentication,
Getting-Started-with-Codespaces, Getting-started, Home, MAPP.UI, Monorepo,
Neon-Serverless-Postgres, Plugins, Roles-[Workspace], Security,
Templates-[Workspace], Terminology, VERCEL, Workspace-Authorization and XYZ.

The [TRUSTED_RETURN_HOSTS](../environment/trusted-return-hosts.md),
[session token claims](../environment/jwt-claims.md) and
[telemetry](../environment/telemetry.md) concepts are not migrations. They cover
variables which the Wiki never documented, written from the current source.

The two large environment/workspace pages are only partially covered. Track
remaining sections before retiring either page. The knowledge check lists the
environment variables still without a concept. Further work includes structured
workspace validation and source-change freshness warnings.

Keep the existing Wiki available during the rollout. The Wiki will be generated
from the bundle on release and on demand, as recorded in
[Wiki publishing](../decisions/wiki-publishing.md). This change does not publish
or delete Wiki pages.
