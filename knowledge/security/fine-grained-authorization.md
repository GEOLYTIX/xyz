---
type: Guide
title: Fine-grained authorization
description: Why the workspace is the single place which decides what each user may see and do across all data sources - locales, layers, rows, fields, themes and editing - through roles and template scopes; read before designing roles or a workspace for restricted data.
tags: [security, authorization, roles, workspace, xyz]
status: draft
sources:
  - id: compose
    resource: ../../apps/xyz/mod/workspace/composeObj.js
  - id: authorization
    resource: ../../apps/xyz/mod/workspace/authorization.js
  - id: query
    resource: ../../apps/xyz/mod/query.js
  - id: getlayer
    resource: ../../apps/xyz/mod/workspace/getLayer.js
  - resource: ../../apps/xyz/mod/workspace/templates/location_get.js
  - resource: ../../apps/xyz/tests/mod/workspace/composeObj.test.mjs
  - resource: ../../apps/xyz/tests/mod/query.test.mjs
---
# Fine-grained authorization

The workspace is the core of XYZ. It is one JSON document that declares every
locale, layer, query template, infoj entry, theme and edit control an
instance offers. Data at rest may sit in several databases or behind other
services. Users never reach that data directly; they reach it only through
the objects the workspace declares. Authorization is therefore defined
once, in the workspace, rather than separately in each data source.

The XYZ API composes the workspace for each request and each user. Locales
and layers are merged from templates, and whatever the user's roles do not
allow is removed before the response leaves the server.[^compose] The client
cannot ask for an object, field or query which composition removed for its
user.

## What a role controls

| Level | Workspace key | Effect for users without the role |
| --- | --- | --- |
| Locale | `locale.roles`, `locale.role` | The locale is not listed and cannot be loaded. |
| Layer | `layer.roles` | The layer is not in the locale; its queries fail. |
| Template | `role` on a layer, locale or query template | The template is not merged; its content never reaches the user. |
| Rows | a role's `filter.default` | Every layer query has the filter added; the request cannot remove it. |
| Fields | `roles` on an infoj entry | The entry is removed, and `location_get` does not select its field. |
| Features | a role object merged into the layer | Themes, dataviews, entries or `edit` settings exist only for the role. |
| Admin queries | `admin` on a query template | Only admin users may run the query. |

Roles come from the user: the [ACL](accounts.md) or a login provider sets
`user.roles`, see [authentication](authentication.md). How `roles` objects
gate and merge is described in [roles](../workspace/roles.md); how scopes
are decided, and how an authorization provider such as OpenFGA can replace
the decision, in [workspace authorization](authorization.md).

## Scopes and roles objects

Two mechanisms work together:

- **Template scopes** describe who may use a template. A template with
  `role` adds that role to the scope of everything merged into it, and nested
  templates join their roles with dots, eg. `client.region`. Use scopes for
  an organisation's structure: a user with `client.region` gets the templates
  scoped `client` and `client.region`, but not those of another region.
- **Roles objects** on a locale, layer or entry gate that object, or merge
  configuration for a role, eg. an extra infoj entry, a role filter or a
  theme. Use them to vary one object between user groups.

One layer template can serve several user groups this way. Each group sees
its own rows, fields and themes, without the layer being copied.

## How a request is checked

1. The request is authenticated and the user, with their roles, is assigned
   to the request params.
2. `getLocale` and `getLayer` compose the locale or layer for the user and
   return an error when the user may not access it.[^getlayer]
3. The [query API](../architecture/xyz-api.md) runs only named query
   templates. A query naming a layer composes that layer for the user first.
   A `table` param must be one of the layer's tables. The layer's
   `filter.default` is always added. `location_get` selects only the fields
   of the user's composed infoj.[^query]
4. The query runs on the `dbs` connection of the template, the layer or the
   workspace, in that order. Different layers can read different databases
   under the same authorization rules.

## Designing for restricted data

- Set `PRIVATE` for internal data. Without it, anonymous users receive every
  locale and layer which has no `roles`; see
  [security practices](practices.md).
- Restrict rows with a role `filter.default` and fields with entry `roles`;
  both are enforced by the server, not only hidden in the UI.
- Give editing its own layer, gated by an editor role, and a `DBS_*`
  connection whose database role can only change the tables and columns that
  layer edits. Database privileges are the last line of defence for data at
  rest.
- Keep sensitive SQL in query templates with a `role` or `admin`, never in
  the client.
- Treat the workspace as code: whoever can change it decides every user's
  access.

## Pitfalls

- A role object on a locale or layer also gates it. Add `"*": true` when the
  object is open to all users and the role only adds configuration.
- A role filter must be `filter.default`; other filter keys are client state
  and do not restrict queries.
- Roles beginning with `!` are not negations.

[^compose]: workspace/composeObj.js composeObj and rolesTemplates
[^getlayer]: workspace/getLayer.js
[^query]: query.js layerQuery and infojMap
