---
type: Guide
title: Extension points
description: The registries plugins extend with layer formats, theme, entry, filter and icon types, panels and dataviews, and how to replace or wrap a MAPP method; use when a plugin adds a type or changes core behaviour.
resource: ../../apps/mapp/lib/mapp.mjs
tags: [plugins, mapp, ui, guide]
status: draft
sources:
  - id: mapp
    resource: ../../apps/mapp/lib/mapp.mjs
  - id: ui
    resource: ../../apps/ui/lib/ui.mjs
  - id: decorate
    resource: ../../apps/mapp/lib/layer/decorate.mjs
  - id: vector
    resource: ../../apps/mapp/lib/layer/format/vector.mjs
  - id: featurestyle
    resource: ../../apps/mapp/lib/layer/featureStyle.mjs
  - id: fields
    resource: ../../apps/mapp/lib/layer/featureFields.mjs
  - id: olstyle
    resource: ../../apps/mapp/lib/utils/olStyle.mjs
  - id: infoj
    resource: ../../apps/ui/lib/locations/infoj.mjs
  - id: filters
    resource: ../../apps/ui/lib/layers/filters.mjs
  - id: view
    resource: ../../apps/ui/lib/layers/view.mjs
  - id: legend
    resource: ../../apps/ui/lib/layers/drawLegend.mjs
  - id: dataview
    resource: ../../apps/ui/lib/Dataview.mjs
  - id: compose
    resource: ../../apps/mapp/lib/utils/compose.mjs
  - id: mapview
    resource: ../../apps/mapp/lib/mapview/_mapview.mjs
---
# Extension points

`mapp.mjs` assigns the MAPP library to `globalThis.mapp`, and `ui.mjs` adds
`mapp.ui`.[^mapp] Core modules call each other through this object, eg.
`mapp.layer.formats[layer.format](layer)`, and look the method up when they
call it. A [plugin](authoring.md) changes MAPP by assigning to it: a
new key in a registry adds a type, a new value for an existing key replaces
a method. `ui.mjs` does the same: it replaces `mapp.utils.alert`,
`mapp.utils.confirm` and `mapp.layer.drawLegend` with ui versions.[^ui]

## Registries

A workspace value selects a method from a registry. A plugin adds a value by
adding the method; the workspace key then accepts it.

| Registry | Called as | Selected by |
| --- | --- | --- |
| `mapp.layer.formats` | `(layer)` | `layer.format`[^decorate] |
| `mapp.layer.featureFormats` | `(layer, features)` | `layer.featureFormat`[^vector] |
| `mapp.layer.themes` | `(theme, feature)`, optional `.retain(theme, featuresObject)` | `theme.type`[^featurestyle] |
| `mapp.ui.layers.legends` | `(layer)` | `theme.type`[^legend] |
| `mapp.layer.featureFields.distribution` | `(layer)` | `theme.distribution`[^fields] |
| `mapp.utils.svgSymbols` | `(icon, feature)`, returns an SVG | `style.icon.type`[^olstyle] |
| `mapp.ui.locations.entries` | `(entry)`, returns an element | `entry.type`[^infoj] |
| `mapp.ui.layers.filters` | `(layer, filter)` | `entry.filter.type`[^filters] |
| `mapp.ui.layers.panels` | `(layer)`, returns a panel | a layer key[^view] |
| `mapp.ui.utils[name].create` | `(dataview)` | `dataview.dataview`, or `chart` and `table`[^dataview] |
| `mapp.layer`, `mapp.plugins` | `(layer)` | a layer key[^decorate] |
| `mapp.plugins` | `(config, mapview)` | a locale key; see [plugins](authoring.md) |

A theme type needs a method in `mapp.layer.themes` to style features and one
in `mapp.ui.layers.legends` to draw its legend. A layer with an unknown
`layer.format` is skipped and a theme with an unknown type is ignored, each
with a warning; an unknown entry type renders nothing.

`mapp.layer.featureFormats` and `mapp.utils.svgSymbols` are module
namespaces, which cannot be extended. Replace them with a copy:

```js
mapp.utils.svgSymbols = {
  ...mapp.utils.svgSymbols,
  star: (icon) => `<svg …>`,
};
```

The [workspace schemas](../workspace/index.md) list the core values of these
keys as `examples`, not as an `enum`, so a workspace with a plugin's value
passes the strict schema.

## Replacing and wrapping methods

Assign a function to replace a method. To keep the core behaviour, keep a
reference to the original and call it:

```js
const decorate = mapp.layer.decorate;

mapp.layer.decorate = async (layer) => {
  layer.attribution ??= { 'My data': 'https://example.org' };
  return decorate(layer);
};
```

`mapp.utils.compose(f, g)` returns a function which passes its argument
through `f` and then `g`; each function takes and returns one value. Bind
the original to compose it into itself:
`mapp.layer.decorate = mapp.utils.compose(mapp.layer.decorate.bind(), logLayer)`;
`logLayer` then receives the promise of the decorated layer.[^compose]

## When an assignment takes effect

Plugin modules assign on import. `mapp.Mapview` imports the URLs in
`locale.plugins` and `layer.plugins` before it runs the plugins and before a
view adds layers, so registrations are in place when layers are
decorated.[^mapview] A replacement applies to calls made after it:

- A layer keeps the style function `mapp.layer.featureStyle(layer)` returned
  when its format was decorated. Replace `featureStyle` before the layers
  are added, or redecorate the layer.
- Methods already called, eg. `mapp.Mapview` itself, stay as they were.
- A plugin loads after `mapp.mjs` and `ui.mjs` and wins over their methods.

## Pitfalls

- A registry key is a workspace value: a plugin which adds `mapp.layer.themes.heat`
  makes `"type": "heat"` valid in every layer of the view. Choose names
  which core MAPP does not use and is unlikely to add.
- Assigning a key which exists replaces the core method for every layer,
  location and view on the page.
- A module namespace throws on assignment in a module: replace the object
  instead of adding a key.
- A method added to `mapp.layer` runs for every layer with a key of its
  name, like a layer plugin.
- The workspace keys a plugin reads are not in the knowledge bundle. The
  strict schema rejects them in documented objects such as a layer; validate
  a workspace with plugin keys against the open schema, or document the keys
  where the schema is generated.

[^mapp]: mapp.mjs
[^ui]: ui.mjs
[^decorate]: layer/decorate.mjs: format check and the layer key loop
[^vector]: layer/format/vector.mjs load
[^featurestyle]: layer/featureStyle.mjs; format/mvt.mjs calls retain
[^legend]: ui layers/drawLegend.mjs
[^fields]: layer/featureFields.mjs process
[^olstyle]: utils/olStyle.mjs
[^infoj]: ui locations/infoj.mjs
[^filters]: ui layers/filters.mjs
[^view]: ui layers/view.mjs
[^dataview]: ui Dataview.mjs
[^compose]: utils/compose.mjs
[^mapview]: mapview/_mapview.mjs mapviewPromise
