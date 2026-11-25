---
type: Workspace Key
title: Locale plugins
description: locale.plugins loads plugin modules, locale keys which match a plugin run it with their configuration, and syncPlugins orders them; use to add tools and buttons to a mapview.
resource: ../../../apps/mapp/lib/mapview/_mapview.mjs
tags: [workspace, locale, plugins, mapp, ui]
status: draft
x-xyz-keys:
  - { key: locale.plugins, type: array }
  - { key: locale.syncPlugins, type: array, default: [zoomBtn, admin, login] }
  - { key: locale.admin, type: [boolean, object] }
  - { key: locale.custom_theme, type: [boolean, object] }
  - { key: locale.dark_mode, type: [boolean, object] }
  - { key: locale.feature_info, type: [boolean, object] }
  - { key: locale.fullscreen, type: [boolean, object] }
  - { key: locale.link_button, type: [boolean, object] }
  - { key: locale.locator, type: [boolean, object] }
  - { key: locale.login, type: [boolean, object] }
  - { key: locale.userIDB, type: [boolean, object] }
  - { key: locale.userLayer, type: [boolean, object] }
  - { key: locale.userLocale, type: [boolean, object] }
  - { key: locale.zoomBtn, type: [boolean, object] }
  - { key: locale.zoomToArea, type: [boolean, object] }
  - key: locale.layer_order
    type: array
    description: Layer keys in draw order; layers not listed are drawn on top.
  - { key: layer.plugins, type: array }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: mapview
    resource: ../../../apps/mapp/lib/mapview/_mapview.mjs
  - id: envreplace
    resource: ../../../apps/xyz/mod/utils/envReplace.js
  - id: ui
    resource: ../../../apps/ui/lib/plugins/_plugins.mjs
  - resource: ../../../apps/mapp/lib/utils/loadPlugins.mjs
  - resource: ../../../public/views/_default.html
  - id: repo
    resource: https://github.com/GEOLYTIX/xyz_plugins
  - resource: ../../../apps/mapp/tests/utils/loadPlugins.test.mjs
  - resource: ../../../apps/mapp/lib/plugins/layer_order.mjs
  - resource: ../../../apps/mapp/tests/plugins/layer_order.test.mjs
---
# Locale plugins

A plugin is a method in `mapp.plugins`. A locale key with the name of a plugin
runs that plugin with the key's value as configuration and the mapview, after
the mapview is created and before its layers are added.[^mapview] Errors are
logged and do not stop the mapview.

The ui library provides `admin`, `custom_theme`, `dark_mode`, `feature_info`, `fullscreen`,
`link_button`, `locator`, `login`, `userIDB`, `userLayer`, `userLocale`,
`zoomBtn` and `zoomToArea`, eg. `"fullscreen": true`.[^ui]

The MAPP library's `layer_order` plugin sorts `locale.layers` by a list of
layer keys. Layers are added with increasing zIndex, so later keys are drawn
on top; layers not in the list keep their order and go to the end, on top of
the listed layers.[^layerorder]

## Loading plugins

`plugins` lists URLs of plugin modules to import first, eg. the tabulator and
chartjs dataview plugins from the
[xyz_plugins repository](https://github.com/GEOLYTIX/xyz_plugins). The XYZ API
replaces `${NAME}` in each URL with the `SRC_NAME` environment
variable.[^envreplace] `layer.plugins` are added to the locale's list.

`syncPlugins` lists plugin keys which run first, one after another, in order;
the rest run in parallel. The default view sets it to `zoomBtn`, `admin`,
`login`, which orders the buttons. Layer keys matching a plugin run it for
that layer; see [layer display](../layer/display.md).

## Pitfalls

- A plugin URL is loaded into every user's browser. Only list sources the
  deployment controls.
- A locale key which is not a plugin is ignored, so a misspelt plugin key
  does nothing.

# Examples

The fullscreen and locator buttons, with the zoom button first.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "syncPlugins": ["zoomBtn"],
    "zoomBtn": true,
    "fullscreen": true,
    "locator": true,
    "layers": {
      "countries": {
        "display": true,
        "format": "geojson",
        "table": "naturalearth.countries",
        "geom": "geom_4326",
        "srid": "4326",
        "qID": "id"
      }
    }
  }
}
```

[^mapview]: mapp mapview/_mapview.mjs mapviewPromise and executePlugin
[^ui]: ui plugins/_plugins.mjs
[^envreplace]: utils/envReplace.js
[^layerorder]: mapp plugins/layer_order.mjs and its tests
