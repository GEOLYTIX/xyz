---
type: Workspace Key
title: Roles
description: roles and role restrict locales, layers, templates and entries to user roles, and merge role-specific configuration; use to control who sees and does what.
resource: ../../apps/xyz/mod/workspace/composeObj.js
tags: [workspace, roles, security, xyz]
status: draft
x-xyz-keys:
  - { key: locale.roles, type: object }
  - { key: locale.roles.*, type: [boolean, object], ref: locale }
  - { key: locale.role, type: string }
  - { key: layer.roles, type: object }
  - { key: layer.roles.*, type: [boolean, object], ref: layer }
  - { key: entry.roles, type: object }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Roles-%5BWorkspace%5D
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: compose
    resource: ../../apps/xyz/mod/workspace/composeObj.js
  - id: scopes
    resource: ../../apps/xyz/mod/workspace/scopes.js
  - resource: ../../apps/xyz/mod/workspace/_workspace.js
  - resource: ../../apps/xyz/tests/mod/workspace/composeObj.test.mjs
  - resource: ../../apps/xyz/tests/mod/workspace/scopes.test.mjs
---
# Roles

A user's roles are strings in `user.roles`. The XYZ API composes every locale
and layer for the requesting user, so a user only receives what their roles
allow. All role handling happens on the server.[^compose]

## The roles object

`roles` maps role names to a value:

- `true` (or `null`) gates the object: on a locale or layer, the user needs
  one of the gating roles; on a nested object, eg. an infoj entry, the object
  is removed for users without one.
- An object is merged into the locale, layer or entry for users with that
  role only. On a locale or layer it also counts as a gating role.
- `"*": true` opens the object to every user, including anonymous users,
  while object roles still merge for their users.

```json
"roles": {
  "*": true,
  "analyst": { "infoj": [{ "field": "pqi", "title": "PQI" }] },
  "fascia_filter": { "filter": { "default": { "fascia": { "in": ["Budgens"] } } } }
}
```

A role filter must set `filter.default`: only the default filter is applied
to queries; see [layer filter](layer/filter.md). The Wiki's example merged
the filter expression directly into `filter`, where it has no effect.

## Scopes

A template or locale with `role` adds that role to the scope of everything
merged into it. Nested scopes join with dots: a user with the role
`europe.france` may access objects scoped `europe` and `europe.france`. A
template whose scope the user lacks is not merged.[^scopes] An authorization
provider can replace these checks; see the security concepts.

## Pitfalls

- A role name starting with `!` is listed by the roles endpoint, but
  composition does not treat it as a negation. Do not rely on negated roles.
- Without `"*"`, every object role also gates the layer, so users without
  any of the roles lose the whole layer.

# Examples

An open layer whose filter and extra entry merge for two roles. The test
requests are anonymous and receive the unfiltered layer.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "layers": {
      "retail_points": {
        "display": true,
        "format": "wkt",
        "table": "geodata.uk_glx_open_retail_points",
        "geom": "geom_p_4326",
        "srid": "4326",
        "qID": "id",
        "infoj": [{ "field": "store_name", "title": "Name" }],
        "roles": {
          "*": true,
          "analyst": { "infoj": [{ "field": "size_band", "title": "Size" }] },
          "tesco_only": { "filter": { "default": { "retailer": { "in": ["Tesco"] } } } }
        }
      }
    }
  }
}
```

[^compose]: workspace/composeObj.js rolesTemplates
[^scopes]: workspace/scopes.js checkScope
