---
title: Dataviews
tags: [configure]
layout: root.html
---

Layer data can be displayed in tables. Tables are defined inside `layer.tableview: {}` object:

```text
"tableview": {
	"tables": {
	    "Retail Places": {
	    	"from": "dev.retailplaces", // data source
	    	"columns": [
	    	{
	    		"title": "ID",
	    		"field": "id"
	    	},{
	    		"field": "dev_date",
	    		"title": "Date",
	    		"type": "date"
	    	},{
	    		"field": "rp_type"
	    	}
	    	]
	    },
	    ...
	}
}
```

On row click feature is selected in the location view:

Layer data can be displayed in a scatterplot and bubble chart. These chart types are meant for presenting long series of x, y pairs (scatterplot) or x, y, r tripples (bubble chart) therefore as of now they are better suited for layer data.

Layer charts are defined inside `"layer.tableview"` object.

Find bubble chart configuration below:

```text
    "tableview": {,
        "charts": {
            "Retail strength": {
                "display": true,
                "chart": {
                    "type": "bubble"                         // chart options
                },
                "from": "dev.retailplaces",
                "columns": [                                 // first 3 entries must be numeric or integer
                    {
                        "title": "Units",                    // first entry is x-coordinate
                        "field": "est_units",
                        "type": "integer"
                    },{
                        "title": "Brands",                   // second entry is y-coordinate
                        "field": "est_brands",
                        "type": "integer"
                    },{
                        "title": "Strength",                 // third entry is a bubble radius
                        "field": "comp_strgh",
                        "fieldfx": "(comp_strgh/1000000)",
                        "type": "integer"
                    },{
                        "title": "Name",                     // fourth entry is a data point label
                        "field": "rp_name"
                    }
                ]
            }
        }
    }
```

Scatterplot settings are similar to bubble chart without the radius coodinate:

```text
    "tableview": {
	    "charts": {
	        "Services share": {
	    	    "display": true,
	    	    "chart": {                               // chart options
	    		    "type": "scatter",
	    		    "pointStyle": "triangle",
	    		    "radius": 10
	    	    },
	    	    "from": "dev.retailplaces",
	    	    "columns": [
	    	        {
	    	    	    "field": "fbl",                           // first entry is x-coordinate, numeric or integer
	    	    	    "title": "Food / Beverage / Leaisure",
	    	    	    "type": "numeric"
	    	        },{
	    	    	    "field": "services",                      // second entry is y-coordinate, numeric or integer
	    	    	    "title": "Services",
	    	    	    "type": "numeric"
	    	        },{
	    	    	    "title": "Name",                         // third entry is a data point label
	    	    	    "field": "rp_name"
	    	    	}
	    	    ]
	        }
	    }
    }
```