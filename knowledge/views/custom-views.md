---
type: Guide
title: Building a custom view
description: How to write an HTML view which loads OpenLayers, MAPP and MAPP.UI, a locale with its plugins and layers, and register it as a workspace template; use when creating any view other than the default.
resource: ../../public/views/_default.html
tags: [views, mapp, ui, guide, html]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Application-Views/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: default
    resource: ../../public/views/_default.html
  - id: mapp
    resource: ../../apps/mapp/lib/mapp.mjs
  - id: ui
    resource: ../../apps/ui/lib/ui.mjs
  - id: mapview
    resource: ../../apps/mapp/lib/mapview/_mapview.mjs
  - id: attribution
    resource: ../../apps/mapp/lib/mapview/attribution.mjs
  - id: locale
    resource: ../../apps/xyz/mod/workspace/getLocale.js
  - id: addlayer
    resource: ../../apps/mapp/lib/mapview/addLayer.mjs
---
# Building a custom view

A custom view is an HTML template served by the [view API](view-api.md).
It loads the libraries and a locale, and builds its page around mapviews.
Start from this page, or copy [_default.html](../../public/views/_default.html)
when the view needs the full map application.

## Example

A map with the locale from the `locale` URL hook, its plugins and layers.

```html
<!doctype html>
<html lang="{{language}}">
<head data-dir="{{dir}}">
  <title>{{title}}</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- OpenLayers must be loaded before MAPP. -->
  <script src="https://cdn.jsdelivr.net/npm/ol@v10.8.0/dist/ol.js"
    integrity="sha384-MW7s77hf0z6FJ3pLxOJ3STIrnMERs4FRQEDpqDrHpJX1mG0qr5Zd9glUb5XC4dA0"
    crossorigin="anonymous"></script>
  <link rel="stylesheet" href="{{dir}}/public/css/mapp.css">
  <link rel="stylesheet" href="{{dir}}/public/css/ui.css">
  <script type="module" src="{{dir}}/public/js/lib/mapp.js"></script>
  <script type="module" src="{{dir}}/public/js/lib/ui.js"></script>
  <style>
    html, body { height: 100%; margin: 0; }
    #Map { position: relative; height: 100%; }
    #OL { position: absolute; inset: 0; }
  </style>
</head>
<body>
  <div id="Map">
    <div id="OL"></div>
    <div id="mapButton" class="btn-column"></div>
  </div>
  <script type="module">
    mapp.language = mapp.hooks.current.language || 'en';
    if (mapp.language !== 'en') await mapp.utils.loadDictionary(mapp.language);

    const key = mapp.hooks.current.locale || 'locale';
    const locale = await mapp.utils.xhr(
      `${mapp.host}/api/workspace/locale?locale=${key}&layers=true`);
    if (locale instanceof Error) throw locale;

    // Plugins are only loaded and run if syncPlugins is not empty.
    locale.syncPlugins ??= ['zoomBtn'];

    const mapview = await mapp.Mapview({
      target: document.getElementById('OL'),
      locale,
      hooks: true,
      loadPlugins: true,
      scrollWheelZoom: true,
      mapButton: document.getElementById('mapButton'),
      attribution: { target: document.getElementById('Map') },
    });

    await mapview.addLayer(locale.layers);
    mapview.interactions.highlight();
  </script>
</body>
</html>
```

Add it to the workspace templates and open it at `${DIR}/view/my_view`:

```json
{ "templates": { "my_view": { "src": "file:/public/views/my_view.html" } } }
```

`src` also takes `https:` and `${NAME}` placeholders for `SRC_NAME`
variables; see [templates](../workspace/templates.md). A template named
`default_view` replaces the default view.

## Steps

- **Head.** `data-dir="{{dir}}"` becomes `mapp.host`, the prefix of every
  API request.[^mapp] Use `{{dir}}/public/…` for the library files. Load
  `ui.js` after `mapp.js`; it adds `mapp.ui` and the ui plugins.[^ui]
  Keep the OpenLayers version and `integrity` hash in step with
  `_default.html`; MAPP warns about an older OpenLayers.
- **Script.** Use a module script after the body. Module scripts run in
  order after parsing, so `mapp` and `mapp.ui` exist and top level `await`
  works.
- **User.** Plugins such as `login` and `admin` read `mapp.user`. Set it
  from the response of `/api/user/cookie`, as the default view does; the
  response is an `Error` without an ACL.
- **Locale.** `layers=true` returns `locale.layers` as an array of composed
  layers the user may see.[^locale] Without it `locale.layers` is an object
  of uncomposed layers by key.
  Load single layers from `/api/workspace/layer?locale=…&layer=…`.
- **Mapview.** `mapp.Mapview` needs `locale` and `target`. It returns a
  promise when plugins or SVG templates must load, so always `await` it.
  `view: { lat, lng, z }` overrides `locale.view`; URL hooks override both.
  `hooks: true` writes the map state to the URL.[^mapview] See
  [locale view](../workspace/locale/view.md).
- **Layers.** `addLayer` decorates clones of the JSON layers. Use
  `mapview.layers[key]` afterwards, not the objects passed in.[^addlayer]
- **Interactions.** No interaction runs until the view starts one, eg.
  `mapview.interactions.highlight()` to select locations by click.
- **Attribution.** `attribution.target` is the container. The mapview adds
  the `.map-attribution` and `.attribution-links` elements itself, with
  `links` and the `attribution` of displayed layers.[^attribution]

## Pitfalls

- `mapp.Mapview` only loads and runs [plugins](../plugins/authoring.md) when
  `locale.syncPlugins` is not empty or the locale has `svgTemplates`. The
  default view sets `syncPlugins`; a custom view must too.
- `loadPlugins: true` imports the `locale.plugins` URLs. Ui plugin
  buttons need the `mapButton` element. The map target needs a height.
- The globals are `mapp` and `ui`, in lower case.
- After creation, change the view with `mapview.fitView(extent)` or
  `mapview.Map.getView()`, in `EPSG:3857` unless `locale.srid` differs.

[^mapp]: mapp.mjs mapp.host
[^ui]: ui.mjs
[^locale]: workspace/getLocale.js localeLayers
[^mapview]: mapview/_mapview.mjs decorate and viewConfig
[^addlayer]: mapview/addLayer.mjs
[^attribution]: mapview/attribution.mjs
