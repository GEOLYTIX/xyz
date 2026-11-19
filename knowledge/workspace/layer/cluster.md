---
type: Workspace Key
title: Layer cluster
description: layer.cluster clusters point features either in the browser by pixel distance or in PostGIS by grid resolution; use for dense point layers.
resource: ../../../apps/mapp/lib/layer/format/vector.mjs
tags: [workspace, layer, mapp, cluster]
status: draft
x-xyz-keys:
  - { key: layer.cluster, type: object, formats: [wkt, geojson, cluster] }
  - { key: layer.cluster.distance, type: number, formats: [wkt, geojson] }
  - key: layer.cluster.resolution
    type: number
    formats: [cluster]
    requires: [layer.geom, layer.srid]
  - { key: layer.cluster.hexgrid, type: boolean, formats: [cluster] }
  - { key: layer.cluster.label, type: string }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: vector
    resource: ../../../apps/mapp/lib/layer/format/vector.mjs
  - id: templates
    resource: ../../../apps/xyz/mod/workspace/templates/cluster.js
  - resource: ../../../apps/xyz/mod/workspace/templates/cluster_hex.js
---
# Layer cluster

A point layer clusters in one of two ways. Set exactly one of `distance` and
`resolution`; with both or neither the cluster configuration is ignored with a
warning.[^vector]

**Browser clustering** with `distance`: all features are loaded and Openlayers
merges features closer than `distance` pixels. A `distance` below 1 removes
the cluster configuration. Use it for layers with up to a few thousand
features.

**Database clustering** with `resolution`: PostGIS aggregates features on a
grid whose cell size is `resolution` times the tile width at the current zoom.
The MAPP library then sets `format` to `cluster`, `params.viewport` and
`params.z`, and the query template to `cluster`, or `cluster_hex` with
`hexgrid`.[^templates] Use it for large tables.

- `resolution` must be a number, and `srid` must not be `4326`.
- `label` names the field shown for a cluster.
- Cluster icons and their scaling belong to the layer style.

## Pitfalls

- Database clustering always restricts queries to the viewport, so it needs
  `geom` and `srid` and returns nothing without a map extent.
- The Wiki says `distance` is required for WKT layers; it is required for
  browser clustering of any vector format.

# Examples

Browser clustering of the devdb retail points within 15 pixels.

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
        "cluster": { "distance": 15, "label": "store_name" }
      }
    }
  }
}
```

[^vector]: layer/format/vector.mjs clusterConfig
[^templates]: templates/cluster.js and cluster_hex.js
