/**
The setup module runs in the browser before each module test file.

The MAPP.UI library requires the MAPP library, which requires the Openlayers `ol` global. The setup loads Openlayers from the ol package, the MAPP library from the mapp app, and the MAPP.UI library. The ui module assigns itself as `mapp.ui`.

The `mapp.host` is the testhost url, so `mapp.utils.xhr` requests the XYZ API with the UI test workspace.
*/

import olUrl from 'ol/dist/ol.js?url';
import { afterEach, inject, vi } from 'vitest';
import '../../mapp/css/_mapp.css';
import '../css/_ui.css';

document.head.dataset.dir = inject('XYZ_HOST');

// Restore all vi.spyOn mocks after every test, regardless of how the test body
// exits. A test body may not reach a trailing mockRestore(), eg. an it.fails
// test that throws by design or an assertion that fails, which would otherwise
// leak spies into the next test in the file.
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

await import('../../mapp/lib/mapp.mjs');

await import('../lib/ui.mjs');
