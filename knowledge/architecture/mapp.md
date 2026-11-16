---
type: Guide
title: MAPP and MAPP.UI
description: Browser mapping and UI libraries alongside the XYZ host API.
resource: ../../apps/mapp/lib/mapp.mjs
tags: [mapp, ui, architecture]
status: draft
sources:
  - resource: https://github.com/GEOLYTIX/xyz/wiki/MAPP
    revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../../apps/mapp/lib/mapp.mjs
  - resource: ../../apps/mapp/vite.config.mjs
  - resource: ../../apps/ui/vite.config.mjs
  - resource: ../../apps/mapp/lib/README.md
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

MAPP.UI lives separately under [apps/ui](../../apps/ui). It depends on MAPP;
MAPP can be used without MAPP.UI. Both Vite builds write into `public/js/lib`
without emptying the directory, preserving the other app's output. Use the
app build scripts for JavaScript and CSS; see [DEVELOPING.md](../../DEVELOPING.md).

## API and tests

Use source JSDoc for individual methods and types. The existing
[documentation workflow](../../DOCUMENTATION.md) generates the
[MAPP API reference](https://geolytix.github.io/xyz/mapp/).

Tests are present in [apps/mapp/tests](../../apps/mapp/tests) and
[apps/ui/tests](../../apps/ui/tests); follow [TESTING.md](../../TESTING.md).
The Wiki's statement that there are no replacement library tests is obsolete.
