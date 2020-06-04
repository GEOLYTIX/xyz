---
title: Dataviews
tags: [workspace]
layout: root.html
---

# Dataviews

Dataviews may be configured as an infoj entry for a location or as key/value pair entry in the layers dataviews configuration.

The entry value object will be sent as configuration parameter to the dataviews.create() method.

The query to be used for a dataview must be stored as template. Queries are never sent from the client to the datasource, but a reference for a query template is passed to the Query API with query parameters to be substituted when the query template is rendered.

```json
{
  "type": "dataview",
  "target": "location",
  "query": "shopper towns - population 15 to 21",
  "chart": {
    "labels": [
      "'19",
      "'20",
      "'21"
    ],
    "datasets": [
      {
        "fields": [
          "pop_19",
          "pop_20",
          "pop_21"
        ],
        "backgroundColor": [
          "#C73649",
          "#C12035",
          "#BB0A21"
        ]
      }
    ]
  }
}
```

The `type: "dataview"` is required for dataview entries in the infoj schema.

The `target` defines where the dataview is created. By default, without a target defined, dataviews.create() will generate a div element and assign this element as the dataview target. If called from the layer or location view, the dataview target will be added as a new tab to the tabview. The layer and location view methods for dataviews will attempt to get an element by ID if the target value is a string. A valid ID should be set as the target value if the dataview should be generated in a custom application view. For example on a report template.

`target: "location"` will generate a new target element for the dataview and assign that element to the location view.

`display: true` will define whether the dataview is shown by default. If not set the dataview will be represented as a checkbox in the layer or location view to be displayed if ticked.

## Charts

A `chart` entry will be passed by the dataviews.create() method to the ChartJS library which is compiled as a util in the XYZ Library.

Please refer to the [ChartJS documentation](https://www.chartjs.org/docs/latest/) for layout and dataset configuration.

## Tables

A `columns` entry will be passed by the dataviews.create() method to the Tabulator library which is compiled as a util in the XYZ Library.

Please refer to the [Tabulator documentation](http://tabulator.info/docs/4.6) for table layout and column configuration.

```
"dataviews": {
  "Stores": {
    "display": true,
    "layout": "fitColumns",
    "query": "store_table",
    "viewport": true,
    "selectable": true,
    "table": "schema.table_name",
    "toolbar": {
      "viewport": true
    },
    "columns": [
      {
        "title": "Store",
        "field": "store_name"
      },
      {
        "title": "Status",
        "field": "status"
      }
    ]
  }
}
```

With the selectable flag set to true, the locations.select() method will be called from a row click. This requires the layer, table, and id to be defined for either the dataview or in the row data.

The row data consists of all the fields returned in a record from the query. The `field` must match the field in the query for the field value to be displayed in the table.

## Toolbars

Toolbars are control element to be displayed prior to the dataview element. It is possible to assign control buttons for export or viewport settings to the toolbar.

The `viewport: true` option in the toolbar entry will create a viewport button in the toolbar which will toggle whether the viewport option is set for the dataview query.