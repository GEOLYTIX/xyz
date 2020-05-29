---
title: Client
tags: [develop]
layout: root.html

---

The [**/ root**](../routes/root.md) route will check whether incoming requests come from a mobile platform using the [mobile-detect](https://github.com/hgoebl/mobile-detect.js) node module. If provided with an access token \(required for private applications\), the backend will assemble a website template \([desktop](https://github.com/GEOLYTIX/xyz/blob/master/views/desktop.html) or [mobile](https://github.com/GEOLYTIX/xyz/blob/master/views/mobile.html)\) and script bundle.

The client interface consists of two containers. The control container which is on the left \(desktop\) or a slider at the bottom \(mobile\) and the map container.

The control container has a section for layers and \(selected\) locations. Layers and locations are displayed as expandable drawers. The map control contains data attribution and a button array.

If enabled, a gazetteer control will be displayed on top of the layer control \(desktop\) or at the top of the map control \(mobile\).

[xyz\_entry](https://github.com/GEOLYTIX/xyz/blob/master/public/js/xyz_entry.js) is the entry point in the script bundle. The client interface is written as a collection of ES6 modules which must be imported by the browser. A webpack bundle will provided for browser which do not support dynamic ES6 module imports.

The client application initialization flow is as follows:

1. Import \_xyz which holds all application utils, controls and parameter as well as the client workspace.
2. Import token module and renew the temporary token provided with the application template.
3. Apply browser interface \([mobile](https://github.com/GEOLYTIX/xyz/blob/master/public/js/mobile_interface.js) / [desktop](https://github.com/GEOLYTIX/xyz/blob/master/public/js/desktop_interface.js)\) methods.
4. Initialise hooks provided as URL query parameter.
5. Initialise the current locale.
6. Initialise the map control based on the locale and hooks.
7. Initialise the layers control.
8. Initialise the locations control.
9. Initialise the gazetteer control.
10. Initialise the locate control.