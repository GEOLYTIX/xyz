---
type: Guide
title: MAPP.UI
description: How the MAPP.UI library in apps/ui builds on the mapp global, its module map (elements, layers, locations, plugins, Dataview, Tabview, Gazetteer) and how views wire it to a mapview; use before changing ui modules or the default view.
resource: ../../apps/ui/lib/ui.mjs
tags: [ui, mapp, architecture, browser]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/MAPP.UI/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: ui
    resource: ../../apps/ui/lib/ui.mjs
  - id: readme
    resource: ../../apps/ui/README.md
  - id: listview
    resource: ../../apps/ui/lib/locations/listview.mjs
  - id: layerview
    resource: ../../apps/ui/lib/layers/view.mjs
  - id: infoj
    resource: ../../apps/ui/lib/locations/infoj.mjs
  - id: plugins
    resource: ../../apps/mapp/lib/mapview/_mapview.mjs
  - id: lint
    resource: ../../.github/workflows/biome.yml
  - resource: ../../public/views/_default.html
  - resource: ../../apps/ui/tests/smoke.test.mjs
  - resource: ../../apps/ui/tests/locations/infoj.test.mjs
---
# MAPP.UI

MAPP.UI builds the interface around a MAPP mapview: layer and location views,
filters, legends, dataviews, tabs, the gazetteer and mapview buttons. It lives
in [apps/ui](../../apps/ui) (`@geolytix/mapp-ui`) and is bundled as
`public/js/lib/ui.js` with `public/css/ui.css`. For the library split see
[MAPP and MAPP.UI](mapp.md).

## The mapp global

MAPP.UI imports nothing from `apps/mapp`. It uses MAPP through the `mapp`
global, eg. `mapp.utils`, `mapp.dictionary`, `mapp.layer`, `mapp.user`,
`mapp.hooks` and `mapp.host`. `mapp.js` must load before `ui.js`.[^readme]

On load, [ui.mjs](../../apps/ui/lib/ui.mjs) assigns itself as `mapp.ui` and
`globalThis.ui`, and patches MAPP:[^ui]

- `mapp.utils.alert()` and `confirm()` become ui dialogs.
- `mapp.layer.drawLegend()` becomes the ui legend renderer.
- the ui plugins are added to `mapp.plugins`.

The dependency runs one way. MAPP must work without MAPP.UI; the lint workflow
fails if `apps/mapp/lib` references `mapp.ui` or imports from `apps/ui`.[^lint]
MAPP therefore never calls the ui. The ui hooks in through objects MAPP
already uses, listed below. Loading `mapp.js` again after `ui.js` replaces the
global and drops the ui.

## Module map

| Module | Role |
| --- | --- |
| [elements/](../../apps/ui/lib/elements) | Generic controls: dialog, drawer, dropdown, slider, pills, searchbox, toast, login and register forms. |
| [layers/](../../apps/ui/lib/layers) | Layer `listview`, layer `view`, `panels` (meta, style, filter, dataviews, draw, ...), `legends` and `filters`. |
| [locations/](../../apps/ui/lib/locations) | Location `listview`, location `view`, `infoj` and `entries` per entry type. |
| [plugins/](../../apps/ui/lib/plugins) | Mapview buttons and tools: zoomBtn, admin, login, locator, fullscreen, dark_mode, userLayer, ... |
| [utils/](../../apps/ui/lib/utils) | Dataview helpers, histogram, colour theme, idle logout, resize handler. |
| [Dataview.mjs](../../apps/ui/lib/Dataview.mjs) | Decorates a dataview: JSON, Tabulator table or ChartJS chart. |
| [Tabview.mjs](../../apps/ui/lib/Tabview.mjs) | Tabs and panels, eg. the dataview tabs below the map. |
| [Gazetteer.mjs](../../apps/ui/lib/Gazetteer.mjs) | Search box over `mapp.utils.gazetteer`. |

## How the ui attaches to MAPP

- **Views wire it up.** A view script such as [_default.html](../../public/views/_default.html)
  creates the `mapp.Mapview`, then calls `mapp.ui.layers.listview`,
  `mapp.ui.locations.listview`, `mapp.ui.Gazetteer` and `mapp.ui.Tabview` with
  its own target elements. MAPP alone renders a map without these panels.
- **Layers.** The layer listview creates a `layer.view` for each mapview
  layer. The view calls `mapp.ui.layers.panels[key]` for each layer key with
  a panel, ordered by `viewConfig.keyOrder`.[^layerview] A new panel is a new
  module in `layers/panels` named after its layer key.
- **Locations.** The location listview replaces `mapview.locations` with a
  Proxy. When MAPP stores a location there, the proxy assigns a record
  symbol and colour and calls `mapp.ui.locations.view`.[^listview] The view
  renders `location.infoj`; each entry is drawn by
  `mapp.ui.locations.entries[entry.type]`.[^infoj]
- **Plugins.** MAPP calls `mapp.plugins[key](locale[key], mapview)` for each
  locale key with a plugin function.[^plugins] Ui plugins add buttons to the
  mapview and need MAPP.UI loaded. See [Locale plugins](../workspace/locale/plugins.md).
- **Dataviews.** Chart and table dataviews need ChartJS or Tabulator loaded
  by a plugin; `Dataview` checks for them. See [Dataviews](../workspace/dataviews.md).

## Where to change

- A new control: a module in `elements/` and its export in `_elements.mjs`.
- A new entry type: a module in `locations/entries/` and `_entries.mjs`;
  document it in [Entry types](../workspace/location/entry-types.md).
- A new layer panel: a module in `layers/panels/` and `_panels.mjs`.
- A new mapview button: a plugin in `plugins/` and `_plugins.mjs`; document
  its locale key in [Locale plugins](../workspace/locale/plugins.md).
- Behaviour MAPP needs without the ui belongs in `apps/mapp/lib`, with a
  plain fallback the ui can replace, like `drawLegend`.
- Styles: `apps/ui/css`, bundled from `_ui.css`. `ui.css` loads the fonts and
  palette that `mapp.css` relies on.

## Tests

[apps/ui/tests](../../apps/ui/tests) has Vitest browser module tests
(`*.test.mjs`) mirroring `lib/`, and Playwright tests of the default view
(`*.spec.mjs`), both against the testhost. Run `pnpm test:ui`; see
[TESTING.md](../../TESTING.md). Many ui modules have no tests yet.

## Corrections to the Wiki

The Wiki said the ui JSDoc is built from `apps/mapp/lib/ui`. The source is
`apps/ui/lib`, a separate app and bundle.[^wiki]

[^wiki]: MAPP.UI Wiki page at revision 3fc379b
[^ui]: apps/ui/lib/ui.mjs
[^readme]: apps/ui/README.md
[^listview]: apps/ui/lib/locations/listview.mjs
[^layerview]: apps/ui/lib/layers/view.mjs
[^infoj]: apps/ui/lib/locations/infoj.mjs
[^plugins]: apps/mapp/lib/mapview/_mapview.mjs
[^lint]: .github/workflows/biome.yml
