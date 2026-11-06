/**
The setup module runs in the browser before each module test file.

The MAPP.UI library requires the MAPP library, which requires the Openlayers `ol` global. The setup loads Openlayers from the ol package, the MAPP library from the mapp app, and the MAPP.UI library. The ui module assigns itself as `mapp.ui`.

The `mapp.host` is the testhost url, so `mapp.utils.xhr` requests the XYZ API with the UI test workspace.
*/

import olUrl from 'ol/dist/ol.js?url';
import { inject } from 'vitest';
import '../../mapp/css/_mapp.css';
import '../css/_ui.css';

document.head.dataset.dir = inject('XYZ_HOST');

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
