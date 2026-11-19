---
type: Guide
title: MAPP plugins
description: What MAPP plugins are, how locale and layer keys run them, how the mapview loads plugin modules, and how to write and version one; use when adding a plugin or a tool that the core libraries do not have.
resource: ../apps/mapp/lib/utils/loadPlugins.mjs
tags: [plugins, mapp, ui, guide]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Plugins
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: load
    resource: ../apps/mapp/lib/utils/loadPlugins.mjs
  - id: mapview
    resource: ../apps/mapp/lib/mapview/_mapview.mjs
  - id: layer
    resource: ../apps/mapp/lib/layer/decorate.mjs
  - id: core
    resource: ../apps/mapp/lib/plugins/_plugins.mjs
  - id: ui
    resource: ../apps/ui/lib/plugins/_plugins.mjs
  - id: version
    resource: ../apps/mapp/lib/utils/versionCheck.mjs
  - id: esm
    resource: ../apps/mapp/lib/utils/esmImport.mjs
  - resource: ../apps/ui/lib/ui.mjs
  - resource: ../apps/ui/lib/layers/view.mjs
  - resource: ../apps/ui/lib/locations/infoj.mjs
  - resource: ../apps/mapp/tests/utils/loadPlugins.test.mjs
  - resource: ../apps/mapp/tests/plugins
  - resource: ../apps/ui/tests/plugins
  - id: repo
    resource: https://github.com/GEOLYTIX/xyz_plugins
---
# MAPP plugins

A plugin is a function in `mapp.plugins`. A workspace turns it on with a
key of the same name; the key's value is the plugin's configuration. The
configuration keys are documented in
[locale plugins](workspace/locale/plugins.md).

## Kinds of plugin

- **Locale plugins** run once per mapview, as `plugin(locale[key], mapview)`,
  for every locale key which names a plugin.[^mapview] They add buttons to
  `mapview.mapButton`, panels, or behaviour.
- **Layer plugins** run as `plugin(layer)` in `mapp.layer.decorate` for every
  layer key which names a plugin.[^layer] The layer view does not exist yet.
- **ui extensions** are not in `mapp.plugins`. A module adds a method to a
  ui lookup: `mapp.ui.layers.panels[key](layer)` adds a panel to the layer
  view of layers with that key, `mapp.ui.locations.entries[type](entry)`
  renders an infoj entry type, and the tabulator and chartjs plugins add
  dataview renderers to `mapp.ui.utils`.

Built in are `consent`, `layer_order` and `svg_templates` from
`apps/mapp/lib/plugins`,[^core] and the ui plugins, eg. `zoomBtn`, `login`,
`fullscreen`, which `ui.js` adds to `mapp.plugins`.[^ui]

## Loading and running

`mapp.Mapview` loads and runs plugins only when `locale.syncPlugins` is not
empty or the locale has `svgTemplates`.[^mapview] Then:

1. `layer.plugins` URLs are merged into `locale.plugins`, without duplicates.
2. With the mapview option `loadPlugins: true` (or an array of endings),
   `mapp.utils.loadPlugins(locale.plugins)` imports each URL.[^load]
3. The `syncPlugins` keys run one after another, in order, even without a
   locale key; their configuration is then `undefined`.
4. All other locale keys which name a plugin run in parallel.

`loadPlugins` imports only URLs ending in `.js` or `.mjs`. A URL without
`http` is resolved against the page origin, not `mapp.host`. A module which
fails to load is logged and skipped; the promise always resolves. A plugin
which throws is logged and does not stop the mapview. The XYZ API replaces
`${NAME}` in `locale.plugins` with the `SRC_NAME` variable.

## Writing a plugin

A plugin module assigns its method on import; `loadPlugins` does not
register exports. A minimal locale plugin which adds a button:

```js
// home_button.js
mapp.utils.versionCheck('5.1') || console.warn('home_button needs MAPP v5.1');

mapp.plugins.home_button = (config = {}, mapview) => {
  if (!mapview.mapButton) return;

  mapview.mapButton.append(mapp.utils.html.node`
    <button title=${config.title || mapp.dictionary.home || 'Home'}
      onclick=${() => mapview.Map.getView().setZoom(config.z || 2)}>
      <span class="notranslate material-symbols-outlined">home`);
};
```

```json
"plugins": ["${PLUGINS}/home_button.js"],
"home_button": { "title": "Back to start", "z": 6 }
```

- `mapp.utils.versionCheck(v)` is true when `mapp.version` is `v` or newer.[^version]
- Import third party modules with `mapp.utils.esmImport('name@version')`
  from esm.sh, not at the top of the plugin.[^esm]
- Read texts from `mapp.dictionary`. Store per user state with
  `mapp.utils.userIndexedDB`.
- A plugin which needs another one first, eg. `posthog` after `consent`,
  is listed after it in `syncPlugins`.

## The xyz_plugins repository

[GEOLYTIX/xyz_plugins](https://github.com/GEOLYTIX/xyz_plugins) holds the
plugins shared between deployments, eg. tabulator, chartjs, isoline and
posthog.[^repo] Each plugin lives in a folder named for the MAPP version it
was written for, eg. `v4.21.0/` or `v5.0.0/`, so a workspace pins the
version its deployment runs. The `development` branch (`dev` in its README)
serves development deployments and `main` live ones; changes go through a
pull request to `development`.

## Pitfalls

- A key which names a plugin runs it, whether meant or not. A layer key and
  a locale key with the same name call the plugin with different arguments.
- `mapp.layer` methods with the layer key's name run too, before the plugin.
- A URL with a query string, eg. `plugin.js?v=2`, is not loaded.
- A plugin URL runs in every user's browser; list only sources the
  deployment controls.
- The Wiki points to sample plugins in the GEOLYTIX/mapp repository and
  `geolytix.github.io/mapp` URLs. Shared plugins are now in xyz_plugins.

[^mapview]: mapview/_mapview.mjs mapviewPromise and executePlugin
[^layer]: layer/decorate.mjs
[^core]: plugins/_plugins.mjs
[^ui]: ui plugins/_plugins.mjs and ui.mjs
[^load]: utils/loadPlugins.mjs
[^version]: utils/versionCheck.mjs
[^esm]: utils/esmImport.mjs
[^repo]: xyz_plugins README
