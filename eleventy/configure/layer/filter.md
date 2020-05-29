---
title: Filter
tags: [configure]
layout: root.html
---

Available filter for a layer are defined by filter definition in location infoj array.

By defining a filter infoj array in the layer entry it is possible to create aggregates from a set of filters which are active on the layer.

```text
"filter": {
  "infoj":[
      {
          "label": "ID count",
          "field": "id_count",
          "type": "integer",
          "inline": true,
          "fieldfx": "count(retailpoint_id)"
      }
  ]
}
```

Using the fieldfx capabilities it is possible to aggregate counts or sums for the items which pass through the layers filter.

The aggregate location is temporary.