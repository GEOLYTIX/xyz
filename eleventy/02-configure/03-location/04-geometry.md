---
title: Geometry
tags: [configure]
layout: root.html
---
It is possible to assign geometry fields as infoj entries.

```text
{
  "field": "geom_rplace",
  "fieldfx": "ST_asGeoJson(geom_rplace)",
  "type": "geometry",
  "display": true, // defaults to null
  "style": {
    "stroke": true,
    "color": "#cf0",
    "weight": 2,
    "fill": true,
    "fillOpacity": 0.5
  }
}
```

```display: true```  
If defined additional geometries will be displayed immediately on selection. Immediate display is suppressed by default. This parameter is relevant to non-editable additional geometries only.

A geojson geometry from a geometry field will be displayed with the **style** defined in the infoj entry. The default style will be the defined by the record itself. A **fieldfx** function can be used to turn PostGIS geometries into geojson on the fly.

```text
"name": "Create isoline"
```

Additional geometry has its respective checkbox for creating/deleting/recreating if editing in enabled on the feature. If no editing is set the checkbox has Show/Hide function. "name" property sets label for checkbox. If unset defaults to "Additional geometries". 

The framework supports creation of isolines based on travel time or distance and selected location.
Isolines are provided by third party API services.
At the moment supported providers are Here and Mapbox.

```text
{
	"type": "geometry",
	"field": "", // column to store entry or desired alias, used with "fieldfx"
	"fieldfx": "", // entry column expression
	"edit": {
	    "isoline_here": {
	        "minutes": 15, // defaults to 10
	        "mode": "pedestrian"  // defaults to "car"
	    }
    }
}
```

Isolines can have predefined mode of transport (walking, driving, cycling), range type (time or distance in case of Here) and time frame. These parameters are API-specific and will vary across configurations.

Isolines support **`"slider": true`** property in order to enable custom isoline parameters. 

```text
{
	"type": "geometry",
	"field": "isoline field alias",
	"fieldfx": "ST_asGeoJson(isoline column),
	"edit": {
	    "isoline_here": {
	        "slider": true // enables custom range slider
	    }
    }
}
```

An isoline may have an associated meta data field which will store details of the most recent request sent to third party API.

```text
{
	"type": "geometry",
	"field": "",
	"fieldfx": "",
	"edit": {
	    "isoline_here": {
	        "slider": true,
	        "meta": "metadata_column" // a column of type 'json' in Postgres
	    }
    }
}
```

To include metadata on created isoline add entry to infoj list:

```text
{
	"type": "meta",
	"field": "metadata_column"
}
```

Isoline settings will be displayed only when isoline had been deleted or has not been created.

The metadata entry will be displayed only when isoline exists.