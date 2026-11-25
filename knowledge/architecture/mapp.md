---
type: Guide
title: MAPP and MAPP.UI
description: Browser mapping and UI libraries alongside the XYZ host API.
resource: ../../apps/mapp/lib/mapp.mjs
tags: [mapp, ui, architecture]
status: draft
sources:
  - resource: https://github.com/GEOLYTIX/xyz/wiki/MAPP/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../../apps/mapp/lib/mapp.mjs
  - resource: ../../apps/mapp/vite.config.mjs
  - resource: ../../apps/ui/vite.config.mjs
  - resource: ../../apps/mapp/tests/mapview/removeLayer.test.mjs
---
# MAPP and MAPP.UI

MAPP is the browser mapping library built around OpenLayers. XYZ supplies host
APIs and workspace configuration. A [locale](../workspace/locales.md) describes
the map's configuration; MAPP exposes mapview, layer, location, plugin and utility
operations through `globalThis.mapp`.

The entry module is [mapp.mjs](../../apps/mapp/lib/mapp.mjs). It checks the loaded
OpenLayers version and warns when OpenLayers is absent or older than expected.
Load the required OpenLayers distribution before using MAPP; the entry module
does not install it automatically.

MAPP is the browser side of the [XYZ API](xyz-api.md): it requests locales,
layers and query templates from XYZ, which keeps SQL, connections and roles
on the server. Sites outside XYZ use it as the
[@geolytix/mapp package](mapp-package.md).

MAPP.UI lives separately under [apps/ui](../../apps/ui); see [MAPP.UI](mapp-ui.md).
It depends on MAPP; MAPP can be used without MAPP.UI. Both Vite builds write into `public/js/lib`
without emptying the directory, preserving the other app's output. Use the
app build scripts for JavaScript and CSS; see [DEVELOPING.md](../../DEVELOPING.md).

## API and tests

Use source JSDoc for individual methods and types; see
[DOCUMENTATION.md](../../DOCUMENTATION.md#jsdoc) for the conventions. No API
reference site is generated from it.

Tests are present in [apps/mapp/tests](../../apps/mapp/tests) and
[apps/ui/tests](../../apps/ui/tests); follow [TESTING.md](../../TESTING.md).
