---
type: Feature
title: URL hooks
description: mapp.hooks keeps the locale, view, shown layers and selected locations as URL params, so a link restores the map; use when a view reads URL params or links to another view.
resource: ../../apps/mapp/lib/hooks.mjs
tags: [views, mapp, hooks, url]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Application-Views/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: hooks
    resource: ../../apps/mapp/lib/hooks.mjs
  - id: mapview
    resource: ../../apps/mapp/lib/mapview/_mapview.mjs
  - id: addlayer
    resource: ../../apps/mapp/lib/mapview/addLayer.mjs
  - id: location
    resource: ../../apps/mapp/lib/location/get.mjs
  - resource: ../../apps/mapp/lib/layer/decorate.mjs
  - resource: ../../apps/mapp/lib/location/decorate.mjs
  - resource: ../../apps/mapp/tests/hooks.test.mjs
  - resource: ../../apps/mapp/tests/location/decorate.test.mjs
---
# URL hooks

`mapp.hooks.current` holds the URL params of the page. The MAPP library
parses them once, when it loads.[^hooks] A view reads its options from them,
and a mapview with `hooks: true` writes its state back into the URL.

## Behaviour

- `true` and `false` become booleans. `layers` and `locations` are always
  arrays; any other value with a comma becomes an array.
- A `token` param is removed from `hooks.current` and from the URL.
- `set`, `push`, `filter`, `remove` and `removeAll` change `hooks.current`
  and push the new URL to the browser history.

These hooks have a meaning in MAPP and the default view:

| Hook | Effect |
| --- | --- |
| `locale` | The locale to load; nested locales are comma separated |
| `lat`, `lng`, `z` | The start view; they win over `locale.view`[^mapview] |
| `layers` | Only these layer keys are displayed when added[^addlayer] |
| `locations` | `layerKey!id` of the selected locations[^location] |
| `language` | The language of the dictionary and the view HTML |
| `userlocale` | The name of a locale stored for the user |
| `id`, `layer` | The location of a [report view](linked-views.md) |

With `hooks: true` the mapview sets `lat`, `lng` and `z` after each move,
pushes a layer key to `layers` when the layer is shown and filters it out
when hidden, and pushes and filters `locations` as locations are selected
and removed. The default view sets `locale`.

The location hook is `${layer.key}!${location.id}`. A view selects the
hooked locations after adding the layers:

```js
for (const hook of mapp.hooks.current.locations) {
  const [layerKey, id] = hook.split('!');
  mapp.location.get({ layer: mapview.layers[decodeURIComponent(layerKey)], id });
}
```

## Flow

`mapp.mjs` calls `hooks.parse()` → the view reads `mapp.hooks.current` →
`mapp.Mapview({ hooks: true })` → `updateView`, `addLayer`,
`layer.show`/`hide`, `location.get`/`remove` call `mapp.hooks.set`, `push`
or `filter` → `history.pushState`.

## Where to change

- Parsing and URL updates: `apps/mapp/lib/hooks.mjs`.
- Which state is written: `mapview/_mapview.mjs` (view), `layer/decorate.mjs`
  (layers), `location/get.mjs` and `location/decorate.mjs` (locations).

## Tests

`apps/mapp/tests/hooks.test.mjs` covers parsing, token removal, `set`,
`push`, `filter`, `remove` and `removeAll`.

## Pitfalls

- Only one mapview per page should have `hooks: true`. Two mapviews would
  write the same `lat`, `lng`, `z` and `layers`.
- A non empty `layers` hook overrides `display` of every added layer,
  including layers added later by a script.
- `mapp.location.get` toggles: for a location which is already selected it
  removes the location and returns `undefined`. It also returns `undefined`
  for a layer without `infoj`.
- The URL params also reach the [view API](view-api.md), but only simple
  strings are substituted into the HTML. Read numbers and lists from the
  hooks.
- The Wiki calls the global `MAPP`. The library assigns `mapp`; there is no
  `MAPP` alias.

[^hooks]: hooks.mjs parse
[^mapview]: mapview/_mapview.mjs viewConfig and updateView
[^addlayer]: mapview/addLayer.mjs currentLayers
[^location]: location/get.mjs location.hook
