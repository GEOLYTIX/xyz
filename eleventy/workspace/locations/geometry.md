---
title: Geometry
tags: [workspace, infoj, entry, geometry]
layout: root.html
orderPath: /workspace/locations/_geometry
---

# Additional geometries

`"type": "geometry"`

Entry of type "geometry" allows to visualize geometries associated with selected location. This is often used for representation of catchments, isolines, boundaries relevant to selected location.

The basic setup:

```json
{   
	"title": "Isoline 5min",
	"type": "geometry",
	"field": "isoline_5min",
	"fieldfx": "ST_AsGeoJSON(isoline_5min)"
}
```

This entry uses "geojson" layer type therefore geometry value is passed as GeoJSON object.

In order to display by default set:

```json
"display": true
```

This type supports isolines provided by third party APIs, currently (© HERE)[https://www.here.com/]

```json
{
	"name": "HERE drivetime 5 min",
	"field": "isoline_5min",
	"fieldfx": "ST_asGeoJson(isoline_5min)",
	"type": "geometry",
	"edit": {
		"isoline_here": {  
			"minutes": 5
		}
	}
}
  // "name" is used as custom checkbox name
  // request returns 5 minute drivetime isochrone from Here API
```

Supported HERE API request parameters:

mode: 'car', 'pedestrian', 'truck', 'carHOV', defaults to 'car'
rangetype: 'time', 'distance', defaults to 'time'
distance: distance in kilometres when "rangetype": "distance"


and (© Mapbox)[https://www.mapbox.com/about/maps]

```json
{
	"name": "Mapbox drivetime 5 min",
	"field": "isoline_5min",
	"fieldfx": "ST_asGeoJson(isoline_5min)",
	"type": "geometry",
	"edit": {
		"isoline_mapbox": {  
			"minutes": 5
		}
	}
}
  // request returns 5 minute drivetime isochrone from Mapbox API
```

* Skip "minutes" parameter to use custom slider.
Use "meta" property for both providers in order to store details of most recent isoline.


```json
{
	"name": "Custom HERE Catchment (1)",
	"field": "_isoline_custom1",
	"fieldfx": "ST_asGeoJson(isoline_custom1)",
	"type": "geometry",
    "edit": {
        "isoline_here": {
            "meta": "isoline_custom1_meta"
        }
    }
}
```

Geometry can also support "query" parameter which is independent from selected location. It is useful for more complex geometries which may only be requested when needed.

```json
{
	"name": "All catchments - query",
	"type": "geometry",
	"field": "collection",
	"query": "Shops with all catchments"
}
```

Query should return GeoJSON object as value for given field.


Geometry takes selection style by default and can also accept geojson style object:

```json
{
	"name": "Catchment",
	"field": "catchment",
	"fieldfx": "ST_asGeoJson(catchment)",
	"display": true,
	"type": "geometry",
	"style": {
	    "strokeColor": "#E6C229",
        "strokeWidth": 2,
        "fillOpacity": 0.2,
        "fillColor": "#E6C229"
    }
}
```

Additional geometries has be also displayed as multi geometries with thematic styling.
The following example demonstrates multi geometry returned from a query template along with thematic styling and optional legend:

```json
{
	"name": "All catchments - query",
	"type": "geometry",
	"field": "collection",
	"display": true,
	"query": "Shops with catchments all catchments",
	"style": {
	    "theme": {
	        "legend": true,
            "type": "categorized",
            "field": "catchment",
            "cat": {
                "primary": {
                    "label": "Primary",
                    "style": {
                        "strokeColor": "#5E08E4",
                        "fillOpacity": 0.7,
                        "fillColor": "#5E08E4"
                    }
                },
                "secondary": {
                    "label": "Secondary",
                    "style": {
                        "strokeColor": "#D15CF1",
                        "fillOpacity": 0.7,
                        "fillColor": "#D15CF1"
                    }
                },
                "tertiary": {
                    "label": "Tertiary",
                    "style": {
                        "strokeColor": "#FFB9F2",
                        "fillOpacity": 0.7,
                        "fillColor": "#FFB9F2"
                    }
                }
            }
        }
    }
}
// "legend": true - optional legend
```

Query used for multi geometry in the above example:

```sql
SELECT jsonb_build_object('type', 'FeatureCollection', 'features', b.features) AS collection
FROM (SELECT jsonb_build_array(jsonb_build_object('type', 'Feature', 'properties',
                                                  jsonb_build_object('catchment', 'primary', 'id', id), 'geometry',
                                                  ST_AsGeoJson(catchment_primary)::jsonb),
                               jsonb_build_object('type', 'Feature', 'properties',
                                                  jsonb_build_object('catchment', 'secondary', 'id', id), 'geometry',
                                                  ST_AsGeoJson(catchment_secondary)::jsonb),
                               jsonb_build_object('type', 'Feature', 'properties',
                                                  jsonb_build_object('catchment', 'tertiary', 'id', id), 'geometry',
                                                  ST_AsGeoJson(catchment_tertiary)::jsonb)) AS features
      FROM (SELECT * FROM dev.storelist_1507__19 where id = ${id}) a) b
```

#### Applied z-index
* Layer is by default drawn on z-index: 1 unless configured otherwise.
* The layer brought to front is drawn on z-index: 1000.
* Selected location is drawn on z-index: 1999.
* Additional geometries are drawn on z-index: 999, just below most top layer and under feature of selected location.


## Editing additional geometries

Additional geometries can be drawn manually using map interaction modules.

In order to allow manual creation of shapes set any of the following:

```json
	"edit": {
		"polygon": true,
	  "circle": true,
		"rectangle": true,
		"line": true,
		"freehand": true
	}
```

Each shape can be manually created and edited when existing.

In order to allow manual editing of isolines returned from third party APIs:

```json
"edit": {
	"isoline_here": {
		"geometry": true,
		"minutes": 10
	}
}
// 10-minute Here isoline with enabled manual editing

"edit": {
	"isoline_mapbox": {
		"geometry": true
	}
}
// custom Mapbox isoline with enabled manual editing
```
