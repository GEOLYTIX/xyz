# xyz
A Node.js framework to develop applications and APIs for spatial data.

This readme is striclty for development notes in regard to code style, testing and (potentially) breaking changes.

Detailed release notes will only be published post v1.0.

Please visit the [developer guide](https://geolytix.gitbook.io/xyz-developer-guide) for a description of the project structure, configuration, and methods.

Visit the [user guide](https://geolytix.gitbook.io/xyz-user-guide) for a detailed description of the client interface.


We are still to complete the documentation and implement tests prior to a initial master release.

This branch does not make use of BabelJS to transpile the code.

xyz_entry.js *should* load in modern browser which support ES6 modules. There are however no improvements made to pre-load ressources or to facilitate http2 for parallel loads.

xyz_entry is bundled with webpack4 to facilitate module concatenation and minification of the bundle.

Leaflet, Leaflet.VectorGrid and some D3 modules are included in the bundle.
