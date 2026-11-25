---
type: Guide
title: Report views
description: How layers and locations link to a report view with the location's params, and how a report script shows a location's entries, dataviews and maps; use when building a printable report or a location dashboard.
resource: ../../apps/ui/lib/elements/reportLink.mjs
tags: [views, report, location, ui, guide]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Application-Views/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: link
    resource: ../../apps/ui/lib/elements/reportLink.mjs
  - id: panel
    resource: ../../apps/ui/lib/layers/panels/reports.mjs
  - id: infoj
    resource: ../../apps/ui/lib/locations/infoj.mjs
  - id: dataview
    resource: ../../apps/ui/lib/locations/entries/dataview.mjs
  - id: get
    resource: ../../apps/mapp/lib/location/get.mjs
  - resource: ../../apps/ui/lib/locations/entries/link.mjs
  - resource: ../../apps/ui/lib/layers/legends/_legends.mjs
  - resource: ../../apps/ui/tests/elements/reportLink.test.mjs
  - resource: ../../apps/ui/tests/layers/panels/reports.test.mjs
  - resource: ../../apps/ui/tests/locations/entries/dataview.test.mjs
  - resource: ../../apps/ui/tests/locations/entries/link.test.mjs
---
# Report views

A report is a [custom view](custom-views.md) for one location or layer,
often laid out for printing. The default view links to it with the
location's params; the report script loads the location again.

## Linking to a report

A location entry of `type: link` with a `report` object, or a layer's
`reports` object, renders a link to the view:[^link]

```json
{
  "type": "link",
  "report": { "template": "site_report", "label": "Site report" }
}
```

```json
"reports": { "site_report": { "template": "site_report" } }
```

The link opens
`${DIR}/view?template=site_report&locale=…&layer=…&id=…&lat=…&lng=…&z=…`
in a new tab. `id` is only set for a location. A `params` object adds more
URL params. `report.dialog: true` opens the view in an iframe dialog
instead, except on mobile. `type: report` is a legacy alias of `link`; see
[entry types](../workspace/location/entry-types.md). `layer.reports.drawer:
false` shows the layer's links without a drawer.[^panel]

## Report script

The script of a location report, after the head of the custom view example.
The page has `#map`, `#info` and `#chart` elements.

```js
const { locale: key, layer: layerKey, id } = mapp.hooks.current;

const locale = await mapp.utils.xhr(
  `${mapp.host}/api/workspace/locale?locale=${key}&layers=true`);

// Without hooks the report does not rewrite its own URL.
const mapview = await mapp.Mapview({
  target: document.getElementById('map'), locale });

await mapview.addLayer(locale.layers.filter(
  (layer) => ['base', layerKey].includes(layer.key)));

const location = await mapp.location.get({
  layer: mapview.layers[layerKey], id });

// A report is read only.
location.infoj.forEach((entry) => delete entry.edit);

// Entries in this order: two fields and a dataview with target "chart".
document.getElementById('info').append(
  mapp.ui.locations.infoj(location, ['name', 'size', 'sales_chart']));

location.flyTo();
```

- `mapp.ui.locations.infoj(location, order)` returns the entries as a grid.
  `order` holds entry `key`, `field` or `query` strings, which select and
  order the entries, or entry objects which are added as they are.[^infoj]
- A dataview entry whose `target` is the id of an element in the page is
  always shown in that element.[^dataview] Charts and tables need the
  chartjs or tabulator plugin; see [dataviews](../workspace/dataviews.md).
- `mapp.ui.layers.legends[layer.style.theme.type](layer)` returns a legend
  element for a map in the report.
- `location.flyTo()` fits the map to the location's geometries.
- A JSON layer with `format: geojson` and `features` can show geometries
  from the location's entries on the report map.
- `@media print` and `@page` rules in the view's style block lay out the
  printed pages.

## Pitfalls

- `layer.reports` and `entry.report` pass the map state in the URL, but
  the report loads the locale and layer itself. It sees only what the
  user's roles allow.
- An entry with `skipEntry: true` is skipped by `infoj`. To show a hidden
  dataview entry, call `mapp.ui.Dataview(entry)` and its `update()`.
- `mapp.location.get` returns `undefined` for a layer without `infoj`.
- Report links are built from `mapp.hooks.current`. A mapview without
  `hooks` gives no `lat`, `lng` and `z`.
- The Wiki's `Map.interactions.highlight()` is
  `mapview.interactions.highlight()`, and its `innerHTML = dropdown`
  must be `append(dropdown)`: ui elements are DOM nodes.

[^link]: elements/reportLink.mjs and locations/entries/link.mjs
[^panel]: layers/panels/reports.mjs
[^infoj]: locations/infoj.mjs infoj_orderMap
[^dataview]: locations/entries/dataview.mjs assignTargetFromString
