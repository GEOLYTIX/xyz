# Aggregate Filter



Filtered features can be spatially aggregated if `"aggregate_layer"` property is defined. Aggregate functions support count of features with spatial unit on aggregate layer, sum of numeric attributes and average value. Aggregate layer is a layer object defined within `"layers"` container with the following parameters:

```text
"layers": {
  "<filtered layer>": {
    ...
    "aggregate_layer": "scratch",
    ...
  },
  "scratch": {
    "hidden": true,
    "name": "<layer name for reference>",
    "pane": ["<pane settings>"],
    "format": "geojson",
    "sql_filter": "<field name to store applied filter>",
    "table": "<source table name>",
    "geomq": "<name for layer geometry field, expected SRID 4326>",
    "qID": "<id field name>",
    "infoj": [
      {
        "field": "count.<field name to count>", // count function
        "label": "<label for field>",
        "type": "integer",
        "layer": "<filtered layer>"
      },
      {
        "field": "sum.<field name to sum>", // sum function
        "label": "<label for field>",
        "type": "integer",
        "layer": "<filtered layer>"
      },
      ,
      {
        "field": "avg.<field name to get average>", // average function
        "label": "<label for field>",
        "type": "integer",
        "layer": "<filtered layer>"
      },
      {...}
    ]
  }
}
```

