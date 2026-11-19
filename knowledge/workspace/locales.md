---
type: Workspace Key
title: Workspace and locales
description: The workspace root keys, the default locale and named locales, nested locales and layer defaults; use as the frame of every workspace.
resource: ../../apps/xyz/mod/workspace/getLocale.js
tags: [workspace, locale, xyz, mapp]
status: draft
x-xyz-keys:
  - { key: workspace, type: object }
  - { key: workspace.dbs, type: string }
  - { key: workspace.locale, type: object, ref: locale, default: { layers: {} } }
  - { key: workspace.locales, type: object }
  - { key: workspace.locales.*, type: object, ref: locale }
  - { key: locale, type: object }
  - { key: locale.name, type: string }
  - { key: locale.dbs, type: string }
  - { key: locale.layers, type: object }
  - { key: locale.layers.*, type: object, ref: layer }
  - { key: locale.layer, type: object, ref: layer }
  - { key: locale.locales, type: array }
  - { key: locale.queryparams, type: object }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: getlocale
    resource: ../../apps/xyz/mod/workspace/getLocale.js
  - id: getlayer
    resource: ../../apps/xyz/mod/workspace/getLayer.js
  - id: cache
    resource: ../../apps/xyz/mod/workspace/cache.js
  - resource: ../../apps/xyz/mod/workspace/composeObj.js
  - resource: ../../apps/xyz/mod/utils/merge.js
  - resource: ../../apps/xyz/tests/mod/workspace/getLocale.test.mjs
---
# Workspace and locales

A workspace is one JSON document. Its root keys are `dbs`, the default
connection; `locale`, the default locale; `locales`, the named locales; and
`templates`, see [templates](templates.md). The
[workspace source](../environment/workspace.md) says where it is loaded from.

A locale configures one mapview: its layers, extent and tools. Without a
`locale` the workspace cache uses `{ "layers": {} }`; without `locales` a
single `locale` entry is listed.[^cache]

## Resolution

A locale request names a key of `workspace.locales`, or a template; `locale`
is the default key. The XYZ API composes the locale from its templates and
roles, deep merges it into a clone of `workspace.locale`, and names it after
its key unless it has a `name`.[^getlocale]

Deep merging replaces strings and numbers and merges objects key by key. An
array whose items are all in the existing array replaces it, eg. to reorder
or shorten it; otherwise the whole array is appended to the existing one.

- `locale.layers` maps layer keys to layers; see [layer keys](layer/index.md).
- `locale.layer` is the default for every layer of the locale: each layer is
  merged into a clone of it.[^getlayer]
- `locale.queryparams` are merged into each layer's `queryparams`.
- `locale.dbs` is the connection for layers without their own `dbs`.

## Nested locales

A request for several keys, eg. `locale=europe,france`, merges each following
locale into the one before. `locale.locales` lists the template keys which
can be nested into a locale. Roles of nested locales combine into a scope;
see [roles](roles.md).

## Constraints

- Composition removes locales and layers the requesting user may not access.
  The presence of a key does not mean every user sees it.
- Check nested composition against the getLocale tests before generating
  complex workspaces.

# Examples

A default locale with a shared layer, and two named locales.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "layer": { "attribution": { "Natural Earth": "https://www.naturalearthdata.com" } },
    "layers": {
      "countries": {
        "display": true,
        "format": "geojson",
        "table": "naturalearth.countries",
        "geom": "geom_4326",
        "srid": "4326",
        "qID": "id"
      }
    }
  },
  "locales": {
    "world": { "name": "World" },
    "retail": {
      "name": "UK retail",
      "layers": {
        "retail_points": {
          "display": true,
          "format": "wkt",
          "table": "geodata.uk_glx_open_retail_points",
          "geom": "geom_p_4326",
          "srid": "4326",
          "qID": "id"
        }
      }
    }
  }
}
```

[^cache]: workspace/cache.js
[^getlocale]: workspace/getLocale.js
[^getlayer]: workspace/getLayer.js
