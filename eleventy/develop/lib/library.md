---
title: Library

layout: root.html
group: true
orderPath: /develop/lib/_library
---

# Mapp Library

The Mapp library is the recommended interface for the XYZ API.

The bundled library is available in the public/js directory and may be added to a HTML view as a script tag sourced from the static files of an XYZ Host or directly from the public Github page of the XYZ repostory.

[https://geolytix.github.io/xyz/public/js/mapp.js](https://geolytix.github.io/xyz/public/js/mapp.js)

The [entry point]((https://github.com/GEOLYTIX/xyz/blob/master/lib/index.mjs)) for the Mapp library will assign itself to the global window object as **_xyz** as well as export the _xyz init method as default.

## _xyz(params)

Calling the _xyz() method will return an instance of the Mapp library.

```
const Mapp = _xyz()
```

Params passed to the _xyz() method will be assigned to the Mapp library object.

### host

The XYZ host including the directory if set as `DIR` environment variable. The host parameter must be set in order to allow for any request to the XYZ API.

### hooks

The Mapp library will update URL query params for the map viewport, locale, visible layers, and selected locations if the hooks param is set to true.

