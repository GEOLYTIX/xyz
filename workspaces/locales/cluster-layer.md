# Cluster Layer



A `cluster` layer is a GeoJSON point layer which automatically clusters features based on defined value. The layer can be set as editable. Thematic classification can be applied in categorized or graduated styling.

`cluster` layer further takes the following parameters:

**Clustering parameters**

Cluster layer recognizes the following `style` parameters:

```text
"style": {
	"cluster_label": <field used as label for a single feature>,
  "cluster_cat": <field with clustering property>,
  "cluster_kmeans": <numeric, minimum number of clusters, defaults to 100>,
  "cluster_dbscan": <numeric, maximum distance between locations in cluster (DBScan), defaults  to 0.01>,
	"themes": [] // container for thematic styling
}
```

**Styling**

Cluster style supports custom marker and marker size. Markers can be created with `svg_symbols` module or defined as _svg data URI_.

```text
"markerMin": <numeric, smallest marker size, defaults to 20>,
"markerMax": <numeric, largest marker size, defaults to 40>,
"marker": <svg_symbols options or dataURI>, // default marker for single feature
"markerMulti": <dataURI or svg_symbols options> // markerMulti is a cluster of features
```

**svg\_symbols**

This module creates SVG symbols for cluster features and associated layer legend. Each marker needs `type` and `style`properties.

```text
{"type": "", "style": <Object>}
```

The following marker types are supported:

* `target`

Type `target` is a round icon made of colorful concentric rings. Style for target is an array made of pairs of radius size and hex colour. Radius size starts at maximum 400. Each ring is made of size and colour.

```text
{
  "type": "target",
  "style": [400, "#000", 300, "#FFF", 200, "#000"]
}
```

* `dot`

`dot` is a simple dot marker used fo visualizing grid layers. Style is a object with property `color` only expected as hex colour.

```text
{
  "type": "dot",
  "style": {
    "color": "#333" // dark gray dot
  }
}
```

* `circle`

`circle` is a generic no-fill marker which needs `style.color` property.

```text
{
  "type": "circle",
  "style": {
    "color": "#000" // black-stroke no-fill circle
  }
}
```

* `markerLetter`

`markerLetter` is a pin icon used for selection. Pin is created with a colour and a selection reference letter.

```text
{
  "type": "markerLetter",
  "style": {
    "color": "#333",
    "letter": "A"
  }
}
```

* `markerColor`

`markerColor` is a pin icon with generic use for gazetteer search. Style takes two parameters `colorMarker` and `colorDot`that make up color scheme for the pin.

```text
{
  "type": "markerColor",
  "style": {
    "colorMarker": "#FF0000", // red and yellow pin
    "colorDot": "#FFFF00"
  }
}
```

* `geo`

`geo` is a generic location pin used by navigator.

```text
{
  "type": "geo" // no style property
}
```

**Themes**

In order to display classified clusters `themes` parameters within layer style must be defined. `themes` is an array of theme objects. Currently there are 2 supported classification types: categorized and graduated. Cluster layer supports theme object with the following parameters:

```text
"themes": [
  {
    "label": "<theme title to display>",
    "field": "<column name to classify against>",
	  "type": "<categorized (based on string), graduated (based on number)>",
	  "other": "<boolean, defaults to false, if set true layer includes unclassified features>"
	  "applied": "<boolean, if set to true the theme is applied initially>",
	  "cat": {},
	  "competitors": {}
  },
  {...}
]
```

`"cat"` is a container for thematic categories. Features are classified and styled by categories \(categorized\) or numeric values \(graduated\) defined inside the `"cat"` object.

```text
// configuration for categorized clusters
"cat": {
	"value 1": {
		"marker": "SVG data URL, array of radius between 0 and 400 and a hex colour or svg_symbols module declaration",
		"label": "label for value 1"
	},
	"value 2": {
		"marker": "svg_symbols.target([400, '#2274A5'])", // example value using svg_symbol.target() function
		"label": "label for value 2"
	},
	{...}
}

// configuration for graduated clusters
"cat": [
	{
		"val": 10,
		"marker": "hex colour, array of radius between 0 and 400 and hex colour, SVG data URL or svg_symbols.target()",,
		"label": "label for value 10"
	},
	{
		"val": 20,
		"marker": "svg_symbols.target([400,'#fcfdbf'])",
    "label": "label for value 20"
	}
]
```

`"competitors"` is a container for competitors configuration. If competitors are defined,`markerMulti` will indicate share of each competitor within a cluster based on `"field"` defined in the parent theme object. Size of rings in the marker show share of each competitor group.

```text
"competitors": {
	"value 1": {
		"colour": "<hex colour>",
		"label": "label for value 1"
	},
	"value 2": {
		"colour": "<hex colour>",
		"label": "label for value 2"
	},
	{...}
}
```

