---
title: Application Views

layout: root.html
---

# Application Views

Application views are browser interfaces which consist of HTML(CSS) and Javascript. The default Mapp interface is provided as _default.html, _default.js, and _default.css in the [public/views](https://github.com/GEOLYTIX/xyz/tree/master/public/views) directory.

A series of stylesheet and script must be referenced in the document head of the application view.

```html
<!-- Load openlayers library and stylesheet. -->
<link rel="stylesheet" href="${dir}/css/ol.css" />
<script src="${dir}/js/ol.js" defer></script>

<!-- Load maplibre-gl library required for mbtiles layer. -->
<script src="${dir}/js/maplibre-gl.js" defer></script>

<!-- Load XYZ / MAPP stylesheet and library. -->
<link rel="stylesheet" href="${dir}/css/mapp.css" />
<script src="${dir}/js/mapp.js" defer></script>
```

Aditional script sources (and stylesheets) may be required for plugins and 3rd party utility libraries such as tabulator (eg. `<script src="/js/tabulator.min.js" defer></script>`).

Application views may either be hosted as static files (eg. on Github pages) or XYZ templates. If hosted as template the view can be accessed through the [api/view](/xyz/docs/develop/api/view/) method which allows template parameter substitution.