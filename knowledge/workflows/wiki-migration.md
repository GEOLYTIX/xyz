---
type: Guide
title: Wiki migration inventory
description: Where each page of the hand-written Wiki and each folded root document went in the bundle; use to find the replacement of an old page or to review the migration.
tags: [documentation, migration]
status: draft
sources:
  - resource: https://github.com/GEOLYTIX/xyz/issues/3007
  - resource: https://github.com/GEOLYTIX/xyz/wiki
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
---
# Wiki migration inventory

Source snapshot: `xyz.wiki.git` at `3fc379b7ada42dff57f19e9f28694868e5a17cac`,
compared with the `minor` branch while the migration PR was open. The
concepts are adaptations with corrections, not a verbatim archive: claims
were checked against the code, and each concept notes what it corrected. All
concepts are `draft` until a maintainer has reviewed them.

| Wiki page | Destination |
| --- | --- |
| Home | [Bundle index](../index.md), [about this bundle](../about.md) |
| Workspace-Configuration | [Workspace keys](../workspace/index.md): workspace and locales, locale keys, layer keys, style, location, dataviews, filter expressions |
| Templates-[Workspace] | [Templates](../workspace/templates.md) |
| Roles-[Workspace] | [Roles](../workspace/roles.md), [workspace authorization](../security/authorization.md) |
| Workspace-Authorization | [Workspace authorization](../security/authorization.md) |
| Security | [Security](../security/index.md): practices, user accounts, authentication |
| Custom-Authentication | [Authentication](../security/authentication.md), [access control variables](../environment/access-control.md) |
| Process-Environment | [Environment](../environment/index.md): every variable read by the XYZ API |
| Application-Views | [Views](../views/index.md) |
| Plugins | [Plugin authoring](../plugins/authoring.md), [locale plugins](../workspace/locale/plugins.md) |
| Terminology | [Terminology](../terminology.md) |
| XYZ | [XYZ API architecture](../architecture/xyz-api.md) |
| MAPP | [MAPP architecture](../architecture/mapp.md) |
| MAPP.UI | [MAPP.UI architecture](../architecture/mapp-ui.md) |
| Monorepo | [Monorepo](../architecture/monorepo.md) |
| Clean-code-guidelines | [Clean code](../development/clean-code.md) |
| Getting-started | [Local development](../deployment/local-development.md), [running locally](../deployment/running-locally.md) |
| Getting-Started-with-Codespaces | [GitHub Codespaces](../deployment/codespaces.md) |
| VERCEL | [Deploy to Vercel](../deployment/vercel.md), [Vercel environment](../deployment/vercel-environment.md) |
| Neon-Serverless-Postgres | [Neon serverless Postgres](../deployment/neon.md) |

## Root documents

| Document | Destination |
| --- | --- |
| SETUP.md | [Deployment](../deployment/index.md); the file is a pointer |
| DEPLOYMENT.md | [Deployment](../deployment/index.md); the file is a pointer |
| RELEASING.md, npm publishing | [Publishing the MAPP package](../deployment/mapp-publishing.md); the procedure stays in RELEASING.md |
| apps/mapp/README.md, usage | [The MAPP npm package](../architecture/mapp-package.md); the README stays the npm page |

DEVELOPING.md, TESTING.md, RELEASING.md, CONTRIBUTING.md and DOCUMENTATION.md
stay at the root and are linked from the bundle.

## Left out

Deliberately not migrated: screenshots, steps for removed features (the
mongodb provider, the v4 SAML flags, the MVT cache), and the production CSP
headers of one deployment. Security weaknesses found while checking the code
are reported privately, not in the bundle; see
[security practices](../security/practices.md).

The first table generates the Wiki: `pnpm knowledge:wiki` writes a stub for
each page which links to its destinations in the knowledge portal. Keep a row
for every former page, and keep the first link of each row on the main
replacement. See [documentation publishing](../decisions/documentation-publishing.md).
