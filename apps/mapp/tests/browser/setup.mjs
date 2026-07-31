/**
## /tests/browser/setup

Setup module for the `browser` Vitest project, which runs in a real Chromium
through Vitest Browser Mode.

This project exists for the code that cannot be asserted without a rendering
engine: `lib/mapview/**`, the OpenLayers feature formats, and the style
parsers. Everything else belongs in the `lib` project, which runs in happy-dom
and is an order of magnitude faster.

The real OpenLayers namespace bundle is loaded from the pinned `ol`
devDependency. `lib/**` expects the global namespace shape (`ol.layer.Tile`,
`ol.source.XYZ`), which is what `ol/dist/ol.js` provides -- not the shape of the
package's ES module entry points.

@module /tests/browser/setup
*/

// The bundle is a classic script that declares `var ol = ...` at the top level.
// Importing it would put that declaration in module scope, where lib/** cannot
// reach it, so it is injected as an inline classic script instead -- the same
// way the application loads OpenLayers from a CDN script tag.
import olBundle from 'ol/dist/ol.js?raw';
import { afterEach, vi } from 'vitest';

const script = document.createElement('script');
script.textContent = olBundle;
document.head.append(script);

if (!globalThis.ol?.util?.VERSION) {
  throw new Error(
    'OpenLayers did not attach to globalThis. Check the ol/dist/ol.js import in tests/browser/setup.mjs.',
  );
}

await import('../../lib/mapp.mjs');
await import('../../lib/ui.mjs');

mapp.utils.esmImport = (module) => {
  throw new Error(
    `esmImport('${module}') called in a test. Stub mapp.utils.esmImport for the test that needs it.`,
  );
};

afterEach(() => {
  vi.restoreAllMocks();
});
