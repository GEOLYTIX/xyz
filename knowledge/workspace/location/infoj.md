---
type: Workspace Key
title: Location infoj
description: layer.infoj lists the entries of a location view and where each value comes from; use to configure what a location shows.
resource: ../../../apps/ui/lib/locations/infoj.mjs
tags: [workspace, location, infoj, ui, xyz]
status: draft
x-xyz-keys:
  - { key: layer.infoj, type: array, ref: entry }
  - { key: layer.infoj_order, type: array }
  - { key: layer.infoj_skip, type: array }
  - { key: entry, type: object }
  - { key: entry.key, type: [string, integer] }
  - { key: entry.type, type: string, default: text }
  - { key: entry.field, type: string }
  - { key: entry.fieldfx, type: string }
  - { key: entry.template, type: boolean }
  - { key: entry.default, type: [string, number, boolean, object, array] }
  - { key: entry.nullValue, type: [string, number, boolean, object, array] }
  - { key: entry.jsonb_field, type: string }
  - { key: entry.jsonb_key, type: string, requires: [entry.jsonb_field] }
  - { key: entry.json_field, type: string }
  - { key: entry.json_key, type: string, requires: [entry.json_field] }
  - { key: entry.objectAssignFromField, type: string }
  - { key: entry.objectMergeFromField, type: string }
  - { key: entry.query, type: string }
  - { key: entry.queryparams, type: object }
  - { key: entry.host, type: string }
  - { key: entry.run, type: boolean }
  - { key: entry.queryCheck, type: boolean }
  - { key: entry.runOnce, type: boolean }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: infoj
    resource: ../../../apps/ui/lib/locations/infoj.mjs
  - id: query
    resource: ../../../apps/xyz/mod/query.js
  - id: get
    resource: ../../../apps/xyz/mod/workspace/templates/location_get.js
  - resource: ../../../apps/mapp/lib/layer/decorate.mjs
  - resource: ../../../apps/ui/tests/locations/infoj.test.mjs
---
# Location infoj

A location is one record of a layer table. `layer.infoj` is the ordered list
of entries its location view shows. Each entry has a `type`, `text` by
default, which selects how it is shown; see [entry types](entry-types.md).

## Where values come from

- `field` is a column of the layer table. Opening a location runs the
  `location_get` query, which selects every infoj `field` of the layer.[^get]
- `fieldfx` replaces the column with a SQL expression, selected as `field`,
  eg. `"fieldfx": "ARRAY[ST_X(geom),ST_Y(geom)]"`. It is written into the SQL,
  so it must only come from the workspace.
- With `template: true`, a workspace template named like the `field` supplies
  the expression.[^query]
- `jsonb_field` and `jsonb_key`, or `json_field` and `json_key`, read one key
  of a JSON column. `objectAssignFromField` and `objectMergeFromField` take an
  object value from another entry.
- `query` runs a query template for the entry instead, with `queryparams`;
  `run` or `queryCheck` run it each time the view opens, `runOnce` only the
  first time.
- `default` is the value of a new location; `nullValue` is shown for `null`.

Layer data requests may only ask for fields named in the layer: any `field`
or `fields` value anywhere in the layer configuration. Others are rejected
with 400.[^query]

## Order and skipping

- Entries without `key` get their `field`, or their index, as key.[^infoj]
- `infoj_order` lists entry keys, fields or queries in display order, and
  leaves out the rest. Objects in it are added as extra entries.
- `infoj_skip` skips entries whose key, field, query, type or group is in the
  list, eg. to hide entries from a layer template.

# Examples

The retail points with an ID, a pin, and text entries from the table.

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
        "infoj": [
          { "type": "key" },
          { "field": "pin", "type": "pin", "fieldfx": "ARRAY[ST_X(geom_p_4326),ST_Y(geom_p_4326)]" },
          { "title": "Retailer", "field": "retailer", "inline": true },
          { "title": "Name", "field": "store_name" },
          { "title": "Postcode", "field": "postcode", "skipNullValue": true },
          { "title": "Open Date", "field": "open_date", "type": "date" }
        ],
        "infoj_skip": ["postcode"]
      }
    }
  }
}
```

[^get]: templates/location_get.js
[^query]: query.js infojMap and fields check
[^infoj]: ui locations/infoj.mjs
