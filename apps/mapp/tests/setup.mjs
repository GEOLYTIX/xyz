/**
The setup module runs in the browser before each test file.

The MAPP library expects the Openlayers `ol` global and assigns itself as the `mapp` global. Most MAPP modules use the `mapp` global, so every test file runs with the library loaded.

The `mapp.host` is read from the document head when the library is imported. It is set to the testhost url so that `mapp.utils.xhr` requests the XYZ API with the test workspace.

Openlayers is loaded from the ol package, not from a CDN, so that tests don't depend on the network.
*/

import olUrl from 'ol/dist/ol.js?url';
import { afterEach, inject, vi } from 'vitest';
import '../css/_mapp.css';

document.head.dataset.dir = inject('XYZ_HOST');

// Restore all vi.spyOn mocks after every test, regardless of how the test body
// exits. A test body may not reach a trailing vi.restoreAllMocks(), eg. an
// it.fails test that throws by design or an assertion that fails, which would
// otherwise leak spies into the next test in the file.
afterEach(() => {
  vi.restoreAllMocks();
});

if (!globalThis.ol?.util) {
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = olUrl;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${olUrl}`));
    document.head.append(script);
  });
}

await import('../lib/mapp.mjs');
