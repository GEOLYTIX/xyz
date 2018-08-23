# Client

The root route will check whether the incoming requests come from a mobile platform using the [mobile-detect](https://github.com/hgoebl/mobile-detect.js) node module. The user and session token are decoded for the access key to the workspace configuration. Based on the user, session and configuration [JSRender assembles](http://www.jsviews.com/#jsr-node-quickstart) the website template \([desktop](https://github.com/GEOLYTIX/xyz/blob/master/views/desktop.html) or [mobile](https://github.com/GEOLYTIX/xyz/blob/master/views/mobile.html)\) with the script bundle and workspace configuration.

The application consists of two containers. The control container which is on the left \(desktop\) or a slider at the bottom \(mobile\) and the map container.

The control container has a section for layers and \(selected\) locations. Layers and locations are displayed as expandable drawers. The map container holds attribution as well as the main interface buttons \(zoom, access, locate, gazetteer, report\).

The gazetteer input is displayed at the top of the control container \(desktop\) or at the top of the map container \(mobile\).

[xyz\_entry](https://github.com/GEOLYTIX/xyz/blob/master/public/js/xyz_entry.js) is the entry point in the script bundle.

The client application initialization flow is as follows:

1. Require [utils](https://github.com/GEOLYTIX/xyz/blob/master/public/js/utils.js) and [svg\_symbols](https://github.com/GEOLYTIX/xyz/blob/master/public/js/svg_symbols.js).
2. Process workspace configuration.
3. Apply browser interface \([mobile](https://github.com/GEOLYTIX/xyz/blob/master/public/js/mobile_interface.js) / [desktop](https://github.com/GEOLYTIX/xyz/blob/master/public/js/desktop_interface.js)\) methods.
4. Initialize [hooks](https://github.com/GEOLYTIX/xyz/blob/master/public/js/hooks.js).
5. Initialize [locales](https://github.com/GEOLYTIX/xyz/blob/master/public/js/locales.js).
6. Initialize Leaflet map.
7. Set map view.
8. Declare zoom functions.
9. Declare map view state functions.
10. Initialize [layers](https://github.com/GEOLYTIX/xyz/blob/master/public/js/layers.js) module.
11. Initialize [locations](https://github.com/GEOLYTIX/xyz/blob/master/public/js/locations.js) module.
12. Initialize [gazetteer](https://github.com/GEOLYTIX/xyz/blob/master/public/js/gazetteer.js) module.
13. Initialize [locate](https://github.com/GEOLYTIX/xyz/blob/master/public/js/locate.js) module.
14. Initialize [report](https://github.com/GEOLYTIX/xyz/blob/master/public/js/report.js) module.

We use \(flowmaker\) to generate a diagram of the [entry flow](https://github.com/GEOLYTIX/xyz/blob/master/public/js/xyz_entry.svg).

