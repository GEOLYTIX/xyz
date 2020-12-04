---
title: Dataviews

layout: root.html
group: true
orderPath: /workspace/dataviews/_dataviews
---

# Dataviews

Dataviews allow for the representation of a data response from a query as either table or chart.

Dataviews may be assigned to either locations or a layer itself. The location ID will be provided as a query parameter if the dataview is defined for a location in the infoj array.

```json
{
  "type": "dataview",
  "target": "location",
  "display": true,
  "viewport": true,
  "query": "shopper towns - population 15 to 21"
}
```

The `type: "dataview"` is required for dataview entries in the infoj schema.

The `target` defines where the dataview is created. By default, without a target defined, dataviews.create() will generate a div element and assign this element as the dataview target. If called from the layer or location view, the dataview target will be added as a new tab to the tabview. The layer and location view methods for dataviews will attempt to get an element by ID if the target value is a string. A valid ID should be set as the target value if the dataview should be generated in a custom application view. For example on a report template.

`target: "location"` will generate a new target element for the dataview and assign that element to the location view.

`display: true` will define whether the dataview is shown by default. If not set the dataview will be represented as a checkbox in the layer or location view to be displayed if ticked.

The **query** to be used for a dataview must be stored as template. Queries are never sent from the client to the datasource, but a reference for a query template is passed to the Query API with query parameters to be substituted when the query template is rendered.

With `viewport: true` the current bounds of the mapview will be sent as viewport params with the query.

With `center: true` the current lat, lng, and z of the mapview will be sent as params with the query.

## Dataview Arrays

Multiple dataviews defined in an array `dataviews: []` will be created in the same target element. This allows for multiple dataviews to be shown in a single tabview panel. The parent element of the dataviews in the array will be displayed as a grid. The grid column and row of individual dataview elements in the array can therefore be set in the style entry for each dataview.

## Dataview Class & Style

The string value of the class entry in the dataview configuration will be assigned to the dataviews' target element. This allows for the dataview to be styled according to the class definition in the application views' stylesheet. Inline styles can be assigned to the target element by defining the style specification as a string value in the style entry.

## Toolbars

Toolbars are control element to be displayed prior to the dataview element. It is possible to assign control buttons for export or viewport settings to the toolbar.

The `viewport: true` option in the toolbar entry will create a viewport button in the toolbar which will toggle whether the viewport option is set for the dataview query.