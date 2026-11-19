---
type: Workspace Key
title: Templates
description: workspace.templates holds reusable layers, locales, SQL query templates and views, loaded inline or from a src; use to share configuration and add queries.
resource: ../../apps/xyz/mod/workspace/getTemplate.js
tags: [workspace, template, query, xyz, security]
status: draft
x-xyz-keys:
  - { key: workspace.templates, type: object }
  - { key: workspace.templates.*, type: object }
  - { key: workspace.templates.*.src, type: string }
  - { key: workspace.templates.*.template, type: string }
  - { key: workspace.templates.*.module, type: boolean, requires: [workspace.templates.*.src] }
  - { key: workspace.templates.*.dbs, type: string }
  - { key: workspace.templates.*.admin, type: boolean }
  - { key: workspace.templates.*.layer, type: boolean }
  - { key: workspace.templates.*.role, type: string }
  - { key: workspace.templates.*.statement_timeout, type: integer }
  - { key: workspace.templates.*.include_props, type: array }
  - { key: workspace.templates.*.exclude_props, type: array }
  - { key: layer.template, type: [string, object] }
  - { key: layer.templates, type: array }
  - { key: locale.template, type: [string, object] }
  - { key: locale.templates, type: array }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Templates-%5BWorkspace%5D
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: gettemplate
    resource: ../../apps/xyz/mod/workspace/getTemplate.js
  - id: compose
    resource: ../../apps/xyz/mod/workspace/composeObj.js
  - id: query
    resource: ../../apps/xyz/mod/query.js
  - resource: ../../apps/xyz/mod/workspace/templates/_queries.js
  - resource: ../../apps/xyz/tests/mod/workspace/getTemplate.test.mjs
  - resource: ../../apps/xyz/tests/mod/workspace/composeObj.test.mjs
---
# Templates

`workspace.templates` maps keys to templates. A template is one of:

- a **layer or locale template**, merged into the layers and locales which
  reference it;
- a **query template**: SQL in `template`, or a module whose default export
  renders SQL; requests name it with the `template` param;
- a **view template**: HTML for the view API.

The core query templates, eg. `wkt`, `location_get` and `field_stats`, are
always available; `CUSTOM_TEMPLATES` adds more.[^gettemplate]

## Sources

`src` loads a template when it is first used: `https:` from a URL, `file:`
from the `XYZ_CWD` directory, `cloudfront:` and signer prefixes from their
providers. `${NAME}` in a src is replaced by the `SRC_NAME` environment
variable. `module: true` compiles a JavaScript module from the src. An
unreachable src adds an error to the composed object.

## Composition

`layer.template` names a template, or is an object with a `key`, which the
layer is merged into; the layer's own keys win. `templates` lists more
templates merged into the layer in order. Locales compose the same way.[^compose]
`include_props` and `exclude_props` limit which keys a template contributes.
A template with a `role` is only merged for users with that role; see
[roles](roles.md).

## Query templates

Requests never send SQL. A query template's SQL uses `${name}` for checked
identifiers, eg. `${table}`, `${filter}`, `${viewport}`, and `%{name}` for
values, which are sent as query parameters.[^query] `dbs` selects the
connection; `admin` requires an admin user, and `layer` a layer param;
`statement_timeout` limits the query in milliseconds.

## Pitfalls

- `${...}` is written into the SQL. Use `%{...}` for any value a user can
  choose.
- A template's role hides it from users without the role, silently.

# Examples

A layer template reused by a locale, and a query template shown in a dataview.

```json
{
  "dbs": "DEVDB",
  "templates": {
    "countries_layer": {
      "format": "geojson",
      "table": "naturalearth.countries",
      "geom": "geom_4326",
      "srid": "4326",
      "qID": "id"
    },
    "population_by_continent": {
      "template": "SELECT continent, sum(pop_est) AS population FROM ${table} GROUP BY continent"
    }
  },
  "locale": {
    "layers": {
      "countries": {
        "template": "countries_layer",
        "display": true,
        "dataviews": {
          "continents": {
            "dataview": "Json",
            "query": "population_by_continent",
            "queryparams": { "table": true }
          }
        }
      }
    }
  }
}
```

[^gettemplate]: workspace/getTemplate.js
[^compose]: workspace/composeObj.js mergeTemplateIntoObj
[^query]: query.js getQueryFromTemplate
