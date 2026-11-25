---
type: Workspace Key
title: Layer features
description: Inline layer features, and featureSet and featureLookup which restrict and enrich the features a layer displays; use for layers without a table or showing a subset of one.
resource: ../../../apps/mapp/lib/layer/featureStyle.mjs
tags: [workspace, layer, mapp]
status: draft
x-xyz-keys:
  - key: layer.features
    type: array
    formats: [wkt, geojson, cluster, vector]
    description: Inline features, parsed with layer.featureFormat. A layer with features requests no data.
  - key: layer.featureSet
    type: array
    description: Feature IDs to display; other features are not styled. An empty array displays all.
  - key: layer.featureLookup
    type: array
    description: Objects whose ID property matches a feature ID; only matched features display, with the object's properties.
  - { key: "layer.featureLookup[]", type: object }
  - key: layer.featureLookupId
    type: string
    default: id
    requires: [layer.featureLookup]
    description: Property of the featureLookup objects which holds the feature ID.
sources:
  - id: style
    resource: ../../../apps/mapp/lib/layer/featureStyle.mjs
  - id: vector
    resource: ../../../apps/mapp/lib/layer/format/vector.mjs
  - id: mvt
    resource: ../../../apps/mapp/lib/layer/format/mvt.mjs
  - id: decorate
    resource: ../../../apps/mapp/lib/layer/decorate.mjs
  - id: featureFormats
    resource: ../../../apps/mapp/lib/layer/featureFormats.mjs
  - resource: ../../../apps/xyz/mod/workspace/templates/layer_extent.js
  - resource: ../../../apps/ui/lib/locations/entries/layer.mjs
---
# Layer features

**Inline features.** A vector format layer with `features` parses them with
`featureFormat`, which defaults to `format`, and never requests data;
`reload` only re-renders.[^vector] `geojson` features are GeoJSON Feature
objects with `id`, `geometry` and `properties`; `wkt` features are records
`[id, wkt_geometry, …fields]`. The geometry is read in `srid`, so `srid` and
`qID` are still required.[^featureFormats] There is no `vector` feature
format: a `vector` layer with features sets `featureFormat`.

**featureSet** lists the feature IDs which are displayed. The MAPP library
converts the array to a Set; features whose `id` is not in it are not styled,
and clustering ignores them.[^style]

**featureLookup** is an array of objects. A feature is displayed only when an
object's `featureLookupId` property, `id` by default, equals the feature ID;
the object's properties are then assigned to the feature, so themes and
labels can use them. On an MVT layer a featureLookup requests tiles with
geometry and ID only, so the lookup supplies the properties.[^mvt]

The zoom to extent button of a layer with a featureSet or featureLookup
queries the extent of those IDs only.[^decorate] Location layer entries set
featureSet and featureLookup from the location's data at runtime.

## Pitfalls

- IDs are compared with `===`: `["1", "2"]` matches no integer IDs. Use the
  type the query returns for `qID`.
- An empty `featureSet` displays every feature; an empty `featureLookup`
  displays none.
- `featureLookup` takes precedence over `featureSet` for the extent query.

# Examples

The devdb locations restricted to two IDs, and an inline GeoJSON point.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "layers": {
      "capitals": {
        "display": true,
        "format": "wkt",
        "table": "example.locations",
        "geom": "geom",
        "srid": "4326",
        "qID": "id",
        "featureSet": [2, 3]
      },
      "inline": {
        "display": true,
        "format": "vector",
        "featureFormat": "geojson",
        "srid": "4326",
        "qID": "id",
        "features": [
          {
            "type": "Feature",
            "id": 1,
            "geometry": { "type": "Point", "coordinates": [-0.1276, 51.5072] },
            "properties": { "name": "Geolytix" }
          }
        ]
      }
    }
  }
}
```

[^vector]: layer/format/vector.mjs vector, setSource and reload
[^featureFormats]: layer/featureFormats.mjs geojson and wkt
[^style]: layer/featureStyle.mjs featureProperties; format/vector.mjs clusterGeometry
[^mvt]: layer/format/mvt.mjs wktTileUrlFunction
[^decorate]: decorate.mjs getExtent
