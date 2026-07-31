/**
## /tests/lib/stubs/ol

Minimal stand-in for the OpenLayers global used by the `lib` Vitest project.

The MAPP library expects OpenLayers to be present as a global namespace object
(`ol.layer.Tile`, `ol.source.XYZ`, `ol.proj.transform`). The `lib` project runs
in happy-dom where there is no rendering context, so the real library is not
loaded. This stub satisfies the version check in `lib/mapp.mjs` and keeps module
level `ol` access from throwing.

The stub does not implement OpenLayers behaviour. A test whose assertion depends
on real geometry, projection or rendering belongs in the `browser` project
(`tests/browser/**`), which loads the real `ol/dist/ol.js`.

@module /tests/lib/stubs/ol
*/

/**
Version reported by the stub.

Must satisfy the `ol_current` check in `lib/mapp.mjs`, otherwise every test file
starts with an "Openlayers below current" warning. Keep in step with the `ol`
devDependency in the package.json.
*/
export const OL_VERSION = '10.8.0';

/**
@function namespace

@description
Builds a nested Proxy. Property access returns another namespace so that deep
paths such as `ol.style.Icon` resolve. Calling or constructing returns a plain
tagged object rather than throwing, so that a module which instantiates an
OpenLayers class at import time can still be loaded.

The tagged object is deliberately inert. Tests asserting on its behaviour will
fail on the assertion, which is the intended signal to move that test to the
`browser` project.

@param {string} path Dot path of the namespace being built, for diagnostics.

@returns {Proxy} Nested namespace proxy.
*/
function namespace(path = 'ol') {
  const target = function () {};

  return new Proxy(target, {
    get(_target, property) {
      if (property === OL_STUB) return path;
      if (property === 'VERSION') return OL_VERSION;

      // Let the runtime treat the proxy as a plain object where it needs to.
      if (typeof property === 'symbol') return undefined;
      if (property === 'then') return undefined;

      return namespace(`${path}.${property}`);
    },
    apply() {
      return { [OL_STUB]: `${path}()` };
    },
    construct() {
      return { [OL_STUB]: `new ${path}()` };
    },
  });
}

/**
Symbol tagging every value produced by the stub, so a test can assert that it is
looking at a stub rather than a real OpenLayers object.
*/
export const OL_STUB = Symbol.for('ol.stub');

/**
The stubbed `ol` global.
*/
export const olStub = namespace();
