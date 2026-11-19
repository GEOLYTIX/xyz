---
type: Workspace Key
title: Filter expressions
description: JSON filter expressions which the XYZ API turns into SQL conditions; use when writing layer.filter.default or a filter on a role.
resource: ../../apps/xyz/mod/utils/sqlFilter.js
tags: [workspace, layer, filter, sql, security]
status: draft
x-xyz-keys:
  - { key: filter.*, type: [object, array] }
  - { key: filter.*.eq, type: number }
  - { key: filter.*.gt, type: number }
  - { key: filter.*.gte, type: number }
  - { key: filter.*.lt, type: number }
  - { key: filter.*.lte, type: number }
  - { key: filter.*.in, type: array }
  - { key: filter.*.ni, type: array }
  - { key: filter.*.like, type: string }
  - { key: filter.*.match, type: string }
  - { key: filter.*.boolean, type: boolean }
  - { key: filter.*.null, type: boolean }
  - { key: filter.*.email, type: boolean }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: sqlfilter
    resource: ../../apps/xyz/mod/utils/sqlFilter.js
  - id: query
    resource: ../../apps/xyz/mod/query.js
  - id: tests
    resource: ../../apps/xyz/tests/mod/utils/sqlFilter.test.mjs
---
# Filter expressions

A filter expression is a JSON object whose keys are table columns and whose
values select a filter type. The XYZ API converts it to a SQL condition and
passes every value as a query parameter, never as SQL text.[^sqlfilter]

```json
{ "retailer": { "in": ["Tesco", "Aldi"] }, "pqi": { "gte": 50 } }
```

| Type | Value | SQL |
| --- | --- | --- |
| `eq`, `gt`, `gte`, `lt`, `lte` | number or numeric string | `"col" = $1`, `>`, `>=`, `<`, `<=` |
| `in` / `ni` | array | `"col" = ANY ($1)` / `NOT "col" = ANY ($1)` |
| `like` | string; commas separate alternatives | `("col" ILIKE $1 OR …)` with a trailing `%` |
| `match` | string | `"col"::text = $1`, an exact text match |
| `boolean` | boolean | `"col" IS true` / `IS false` |
| `null` | boolean | `true`: `IS NULL`; `false`: `IS NOT NULL` |
| `email` | any | `"col"::text = ` the requesting user's email |

## Combining

- Several columns in one object, and several types for one column, are joined
  with `AND`.
- An array of objects is joined with `OR`: `[{"a": {"eq": 1}}, {"b": {"eq": 2}}]`.
- A column name must match `^[a-zA-Z_]\w*$`. Otherwise the whole object is
  dropped with a warning.
- An unknown type is ignored silently, so a misspelt type filters nothing.

## Where expressions are used

- `layer.filter.default` in the workspace, always applied; see
  [layer filter](layer/filter.md).
- `layer.filter.current`, sent by the MAPP library as the `filter` request
  param of layer queries.[^query]
- The `sqlFilter` request param of query templates without a layer.

Only query templates containing `${filter}` apply a filter. Of the core
templates in `apps/xyz/mod/workspace/templates/`, the location templates
(`location_get`, `location_update`, `location_delete`, `location_new`,
`location_field_value`), `mvt_geom`, the `st_*` templates, `sql_table_insert`
and `table_schema` contain no `${filter}`. A default filter therefore does not
stop a location being read or edited by its ID.

## Review notes

- The Wiki described `match` as `ILIKE`; the code compares text exactly.[^wiki]
- The Wiki documents a `filter` inside `layer.roles`. Whether a role filter is
  merged into `filter.default` and applied by queries is not yet confirmed
  against `getLayer.js` and `composeObj.js`.
- An array value nested under a column (`{"col": [ … ]}`) calls `sqlfilter`
  without the request and throws. Use a top-level array for `OR`.

# Examples

A complete workspace with a default filter on the devdb retail points. It
shows only Tesco and Aldi stores with a PQI of at least 50.

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
        "filter": {
          "default": {
            "retailer": { "in": ["Tesco", "Aldi"] },
            "pqi": { "gte": 50 }
          }
        }
      }
    }
  }
}
```

[^sqlfilter]: sqlFilter.js
[^query]: query.js layerQuery
[^wiki]: Workspace-Configuration, layer filter section
