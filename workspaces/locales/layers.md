# Layers



`"layers": {}`

Layers are a sub setting of a locale. Each layer object has a set of parameters which depend on the type of layer, whether the layer is interactive or editable and how the data should be styled in the map window. `access` is a layer-specific privilege given to user role. Defaults to `"public"` which does not require login. Access set to `"private"` requires login in order to view content. Value `"admin"` allows all administrative operations and app configuration.

A layer may support the following parameters:

```text
 <layer identifier, SQL legal name recommended> : {
   "group": <group name>, // optional
	 "name": <layer name to display>,
	 "meta": <meta string, data description>,
	 "pane": [<pane name>], 500], // Leaflet equivalent to z-index
	 "format": <"tiles", "mvt", "geojson" or "cluster">,
	 "dbs": <reference to connection string>,
	 "display": <boolean, if set to true layer is initially displayed>,
	 "qID": <field for feature identifier within dataset, default: "id">, // if undefined layer is non-interactive
	 "geom": <geometry field SRID 4326, default: "geom">,
	 "geom_3857": <geometry field SRID 3857, defaults to "geom_3857", parameter required for MVT layer only>,
	 "access": <"public", "private" or "admin", defaults to "public">,
	 "properties": <SQL list of additional fields to select and include within feature followed by comma, optional>,
	 "streetview": <supported by cluster layer, displays Google StreetView in data table for selected feature>,
     "hover": <boolean, enables tooltip on features, cluster layer only>,
     "geomdisplay": <field name for associated geometry for cluster layers if available, such as buffer or catchment, expected format PostGIS geometry SRID 4326, defaults to false>,
     "aggregate_layer": <table to store output of aggregate data filtering>,
     "charts": {},
	 "style": {},
     "infoj": []
 }
```

Layers can be arranged into `groups`.`groups` is a parameter defined inside `locale` object as a `layers` sibling. The following snippet shows definition of a `basemaps` group. Using this key in layer `group` property will display layer as a `basemaps` group member:

```text
"locales": {
  "UK": {
    "groups": {
      "basemaps": {
        "label": "Base maps"
      },
      {...}
    }
  }
}
```

`group` parameter is optional. Ungrouped layers will be displayed below the defined groups.

Each layer object needs `"table"` or `"arrayZoom"` property defined in order to access the source table.

```text
"table": <table name>
```

`"arrayZoom"` is an object that groups related tables assigned to respective zoom levels. This was designed for hierarchical datasets which are subject to geographic generalization.

```text
"arrayZoom": {
	"10": <source table for zoom level 10>,
	"11": <source table for zoom level 11>,
	"12": <source table for zoom level 12 and higher>,
}
```

