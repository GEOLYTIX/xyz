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



## Notable Changes:

Restructure of the \_xyz object.

Workspace is now \_xyz.ws

host, token, view.mode, log, nanoid on root \_xyz.*

Utils are now in \_xyz.utils

Svg_symbol create method and hook methods are now in \_xyz.utils

Classlist methods have been deprecated from utils. Native [classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList) methods add, remove, contains, toggle should be used.

utils.createElement has been replaced with the utils.\_createElement

Fonts are now in a seperate public folder. Only css should be in public\/css. Only js should be in public\/js

Documentation is now served from gitbooks. The documentation property in the workspace must be a URL.

utils.dropdrop factory to create dropdowns from entries array.

Restructure grid fields array. 

```
"grid_fields": [
 {
  "pop__01": "Population 2001"
 },
 {
  "pop__11": "Population 2011"
 }
]
```

## Notes:

mjs scripts should not be much longer than 250 lines. If this is the case it is probably worth investigating whether methods can be put into sub-modules.

Function in the same script should be called more than once otherwise they should either go in a submodule or not be a function in the first place.


When moving js modules into folder the first file should be prefixed with \_

e.g. `import locations from './location/_locations.mjs';`

Object keys should not be quoted.

Single quotes should be used in JS, double quote in HTML. Allowing the use of HTML double quotes in JS strings.

Event listeners should be added to dom items through the createElement method.

Items should be appended to parents through the createElement method.

Arrow functions should be used where possible.

Array functions forEach and map should be used where appropriate. Object maps should faciliotate values as well as keys.

Default ES6 export should be used for factory type methods. Named exports for library type modules.

Comments should always have an empty row above.

If statements with a single expression should be in line.



Prevent large conditional blocks if possible.

DO `if (e.target.status !== 200) return`

DONT `if (e.target.status === 200) { ... }`


Defaults should be in individual modules \_def in the same folder as the dependent script.

e.g.
```
import * as _def from './_def.mjs';
if (!_xyz.ws.select.layers.records) _xyz.ws.select.layers.records = _def.layers.records;
```


Ternary operator should return value not assign value in switch.

DO `let clone = obj instanceof Array ? [] : {};`

DONT `let clone; obj instanceof Array ? clone = [] : clone = {};`



Array.map() should only be used when an array is to be mapped. For iterating without return of a mapped array the Array.forEach() method should be used.
