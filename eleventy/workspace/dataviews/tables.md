---
title: Tables

layout: root.html
---

# Tables

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