---
type: Workspace Key
title: Gazetteer
description: locale.gazetteer adds a search box which finds locations by a column of a layer table, or through a provider plugin; use to let users search places or records.
resource: ../../../apps/mapp/lib/utils/gazetteer.mjs
tags: [workspace, locale, gazetteer, search, mapp, ui]
status: draft
x-xyz-keys:
  - { key: locale.gazetteer, type: object }
  - { key: locale.gazetteer.layer, type: string, requires: [locale.layers.*] }
  - { key: locale.gazetteer.qterm, type: string }
  - { key: locale.gazetteer.label, type: string }
  - { key: locale.gazetteer.table, type: string }
  - { key: locale.gazetteer.title, type: string }
  - { key: locale.gazetteer.placeholder, type: string }
  - { key: locale.gazetteer.leading_wildcard, type: boolean }
  - { key: locale.gazetteer.limit, type: integer, default: 10, minimum: 1, description: Maximum number of results per search. }
  - { key: locale.gazetteer.no_result, type: string }
  - { key: locale.gazetteer.maxZoom, type: integer, minimum: 0 }
  - { key: locale.gazetteer.query, type: string, default: gaz_query }
  - { key: locale.gazetteer.provider, type: string }
  - { key: locale.gazetteer.datasets, type: array }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: gazetteer
    resource: ../../../apps/mapp/lib/utils/gazetteer.mjs
  - id: template
    resource: ../../../apps/xyz/mod/workspace/templates/gaz_query.js
  - resource: ../../../apps/ui/lib/Gazetteer.mjs
  - resource: ../../../apps/ui/tests/Gazetteer.test.mjs
  - resource: ../../../apps/mapp/tests/utils/gazetteer.test.mjs
---
# Gazetteer

`locale.gazetteer` shows a search box in the default view. A search queries
the `qterm` column of the `layer`'s table for values starting with the term
and lists up to `limit` results; selecting one opens the location.[^gazetteer]

- `layer` is a key of `locale.layers`; its current filter applies. `table`
  searches another table.
- `label` is the column shown in the results, `qterm` by default. `title`
  labels the results, defaulting to the layer name.
- `leading_wildcard` also matches the term inside values.
- `no_result` replaces the "no results" text; `null` hides it.
- `maxZoom` limits the zoom when the map moves to a result.
- `query` replaces the `gaz_query` template, which matches
  `qterm::text ILIKE` the term.[^template]
- `datasets` adds searches. Each inherits the gazetteer keys and overrides
  some, eg. another `qterm` and `title`.
- `provider` searches an external service through a plugin, eg. Google
  Places; such plugins have their own keys and API keys.

## Pitfalls

- A gazetteer `layer` which is not in the mapview logs a warning and finds
  nothing.
- Without `qterm` the gazetteer only searches its `datasets` and provider.
- `limit` is the SQL `LIMIT`; `0` falls back to 10 and a negative limit
  fails the query.

# Examples

Search retail points by store name and by postcode.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "gazetteer": {
      "layer": "retail_points",
      "qterm": "store_name",
      "placeholder": "Search stores or postcodes",
      "limit": 5,
      "datasets": [{ "title": "Postcode", "qterm": "postcode" }]
    },
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
```

[^gazetteer]: mapp utils/gazetteer.mjs datasets and search
[^template]: templates/gaz_query.js
