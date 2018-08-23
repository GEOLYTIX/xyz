# Vector Tile \(MVT\) Layer

`mvt` layer is a Mapbox Vector Tile layer served directly with PostgreSQL. This layer type is recommended for polygon and multipolygon geometries. MVT may contain feature properties stored within protobuffer string initially defined in "`properties`" layer parameter.

Typical MVT layer configuration has the following parameters:

```text
"<example_mvt_layer>": {
  "display": true,
  "name": "<layer name>",
  "meta": "<information on data source, license...>",
  "properties": "<comma separated list of fields>",
  "format": "mvt",
  "geom_3857": "<field name for feature geometry SRID 3857>",
  "pane": ["pane name", <pane z-index>],
  "dbs": "<database connection string>",
  "qID": "<feature id field name, if undefined layer is non-interactive>",
  "table": "<source table name or arrayZoom object instead of 'table'>",
  "tilecache": "<optional tilecache table name to store previously generated MVT>",
  "infoj": [{...}, {...}], // see infoj section
  "style": {}
}
```

MVT layers can use default and thematic styling. Style can be also applied based on one of properties defined for the layer.

Basic MVT style configuration:

```text
"style": {
  "default": {
    "weight": 1,
    "color": "#000",
    "fill": true, // required for fillColor parameter
    "fillColor": "#000",
    "fillOpacity": 0.3
  },
  "highlight": { // optional, if undefined default parameters apply
    "color": "#e91e63",
    "fill": true, // required for fillColor parameter
    "fillOpacity": 0.3
  },
  "themes": []
}
```

MVT theme style supports categorized and graduated classifications. Thematic MVT style configuration:

```text
"themes": [
  {
    "label": "<theme label>",
    "type": "categorized", // categorized theme example
    "field": "<field name to classify, defined in properties parameter>",
    "applied": true, // theme to apply initially, defaults to false
    "other": true, // include features other than defined classified values
    "cat": {
      "property 1": {
        "style": {
          "weight": 2,
          "color": "#EF271B",
          "opacity": 1,
          "fillColor": "#EF271B",
          "fill": true,
          "fillOpacity": 0.3
        }
      },
      "property 2": {
        "style": {
          "weight": 2,
          "color": "#BA2D0B",
          "opacity": 1,
          "fillColor": "#BA2D0B",
          "fill": true,
          "fillOpacity": 0.3
        }
      }
    },
    {
      "label": "graduated theme name",
      "type": "graduated", // graduated theme example
      "field": "<numeric field name to classify with>",
      "cat": [
        {
          "val": 250000, // field value to classify
          "style": {
            "stroke": false,
            "fillColor": "#fcfdbf",
            "fill": true,
            "fillOpacity": 0.3
          },
          "label": "up to .25"
        },
        {
          "val": 500000,
          "style": {
            "stroke": false,
            "fillColor": "#fec387",
            "fill": true,
            "fillOpacity": 0.3
          },
          "label": ".5"
        },
        {...}
      ]
    }
  ]
```

Styles defined in `"themes"` array can also be used as default MVT style.

