/**
## /tests/lib/setup

Setup module for the `lib` Vitest project, which tests the MAPP browser library
in a happy-dom environment.

151 of the 184 modules under `lib/**` reach their dependencies through the
`mapp` global rather than importing them. A test therefore cannot import a
single module in isolation and expect it to work -- the namespace has to exist
first.

This module builds that namespace the same way the browser does: by importing
`lib/mapp.mjs` and `lib/ui.mjs` for their side effects. Both assign themselves
to `globalThis`. Tests then call through the global exactly as the application
does.

```js
it('returns an empty string for null params', () => {
  expect(mapp.utils.paramString(null)).toEqual('');
});
```

Because the namespace is a plain mutable object, a dependency is stubbed by
assignment rather than by module factory mocking.

```js
vi.spyOn(mapp.utils, 'xhr').mockResolvedValue({ features: [] });
```

@module /tests/lib/setup
*/

import { afterEach, vi } from 'vitest';
import { olStub } from './stubs/ol.mjs';

// lib/mapp.mjs runs `globalThis.ol ??= {}` and warns when ol.util.VERSION is
// missing. Seed the stub first so the version check passes quietly.
globalThis.ol ??= olStub;

// mapp.mjs logs the OpenLayers version on import. Suppress it for the duration
// of the import only -- a test that wants to assert on console output uses
// mockConsole from tests/scaffold.mjs.
const log = console.log;
console.log = () => {};

await import('../../lib/mapp.mjs');
await import('../../lib/ui.mjs');

console.log = log;

// Both utilities reach the network at call time: esmImport pulls from esm.sh
// and scriptElement appends a script tag for a CDN URL. Neither may run in a
// test. Failing loudly here is better than a silent timeout.
mapp.utils.esmImport = (module) => {
  throw new Error(
    `esmImport('${module}') called in a test. Stub mapp.utils.esmImport for the test that needs it.`,
  );
};

mapp.utils.scriptElement = (src) => {
  throw new Error(
    `scriptElement('${src}') called in a test. Stub mapp.utils.scriptElement for the test that needs it.`,
  );
};

// The mapp namespace is shared state within a test file. Spies assigned onto it
// must not leak into the next test.
afterEach(() => {
  vi.restoreAllMocks();
});
