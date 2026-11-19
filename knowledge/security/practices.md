---
type: Guide
title: Security practices
description: Rules for writing workspaces, templates and deployments safely - trusted workspace content, query parameters, cookies, private instances, least-privilege databases; use before deploying or reviewing a workspace.
tags: [security, workspace, deployment, review]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Security
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: query
    resource: ../../apps/xyz/mod/query.js
  - id: params
    resource: ../../apps/xyz/mod/middleware/validateRequestParams.js
  - id: env
    resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../pnpm-workspace.yaml
  - resource: ../../.github/dependabot.yml
---
# Security practices

## The workspace is code

Whoever can change the workspace or its template sources can run SQL and
serve HTML to every user. Treat workspace files, template `src` locations and
`SRC_*` variables like source code: review changes and restrict who may
write them.

These are written into SQL or HTML unchanged and must only come from the
workspace:

- query template SQL and `${…}` placeholders;
- `fieldfx` on infoj entries and string `filter.default` values;
- HTML in `meta`, `groupmeta`, theme `meta` and `html` entries.

## Queries

Requests never carry SQL: they name a query template and send params. In a
template, `%{name}` becomes a query parameter which PostgreSQL substitutes
safely; `${name}` is written into the SQL text.[^query] Use `%{…}` for any
value a user can choose, and `${…}` only for identifiers the template
controls. The request middleware checks param names, not values.[^params]

Give each `DBS_*` connection the least privilege its layers need, eg. a
role with only `SELECT` on tables which users should not change.

## Access

- `PRIVATE` requires a login for every request; use it for instances with
  internal data. Without it, anonymous users reach every locale and layer
  without `roles`.
- Restrict locales, layers and templates with [roles](../workspace/roles.md);
  composition removes what a user may not access.
- Keep the default `COOKIE_PROPS` (`Secure; HttpOnly; SameSite=Strict`):
  `SameSite=Strict` stops other sites sending requests with the user's
  cookie. Keep `COOKIE_TTL` short and enable `USER_SESSION` when sessions
  must be revocable.[^env]
- `RATE_LIMIT` and `RATE_LIMIT_WINDOW` limit requests per client. Add the
  platform's DDoS protection, eg. Vercel or Cloudflare.

## Dependencies and code

- Dependency versions are managed through the pnpm catalog in
  `pnpm-workspace.yaml`, which also lists the packages excepted from pnpm's
  minimum release age. Dependabot proposes updates; review them like code.
- Every pull request runs the SonarQube Cloud scan and the Biome checks.

## Reporting

Report suspected vulnerabilities privately through a GitHub security
advisory on the repository, not in issues, pull requests or this bundle.
Concepts describe how to use the system safely, not unfixed weaknesses.

[^query]: query.js getQueryFromTemplate and replaceStringParams
[^params]: middleware/validateRequestParams.js
[^env]: utils/processEnv.js
