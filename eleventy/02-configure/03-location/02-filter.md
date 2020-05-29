---
title: Filter
tags: [configure]
layout: root.html
---

Layers which support locations can be filtered. Filter which are defined for entries in the layer's infoj array can be selected from a dropdown in the layers filter panel.

Depending on the type of the entry, different filters are supported. Setting a filter will reload the layer not showing the filtered out locations in the map.

`"filter": "like"`

Like filter allow items where the filter field must begin with the filter term.

`"filter": "match"`

Filter locations where the value of the filter field must exactly match the filter term.

`"filter": "date"`

Allowing to filter locations with date fields according to the date being before or after a date specified in the filter. Input value is allowed 2 decimals for numeric data.

`"filter": "numeric"`

Allowing to filter locations with numeric fields with values being greater or lesser than a number defined in the filter.

Numeric data types allow for 2 decimal input.

```text
"filter": {
  "in": [
    "Class A",
    "Class B",
    "Class C"
  ]
}
```

Filtering by checkbox adds checkboxes for each value added to "in" array within filter object. Applied filters are logically conjunctive.

`"filter": "boolean"`

This filter works with _boolean data type_. Once enabled it displays a checkbox set to `TRUE` by default and updates the map. If unchecked it updates the map to filter `FALSE` fields values. In order to disable the filter it should be cleared.