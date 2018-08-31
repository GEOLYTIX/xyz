# Filter

In order to enable filtering data `"filter"` property in an `"infoj"` item must be defined. The following filter types are supported by cluster and geojson layers:

`"like"` - search for text pattern

`"match"` - search for exact text match

`"date"` - date filtering, later and earlier than

`"numeric"` - number filtering, greater and less than

Filtering by checkbox:

```text
"filter": {
      "in": [<array of values>]
  }
```

Filtering by checkbox adds checkboxes for each value added to "in" array within filter object. Applied filters are logically conjunctive.

