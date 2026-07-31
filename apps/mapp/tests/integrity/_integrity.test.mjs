/**
## _integrity

Entry point for the integrity suite, bundled by esbuild into
`public/js/tests/integrity/_integrity.test.js` and executed in the browser by
the test plugin when `?test=integrity` is present.

These tests assert that a **deployed instance** is correctly configured -- that
its workspace resolves, its layers have reachable sources, and its database
connections answer. That is a property of a running deployment and its Postgres,
not of the source, which is why they stay in the browser on codi rather than
moving to Vitest with the rest of the front-end suite.

Everything else that used to hang off `globalThis._mappTest` has migrated. See
TESTING.md.

@module _integrity
*/

import { layerTest } from './layer.test.mjs';
import { workspaceTest } from './workspace.test.mjs';

/**
@function integrityTests
@async

@description
Runs the workspace and layer integrity suites against a decorated mapview.

@param {Object} mapview The mapview of the running instance.

@returns {Promise<void>}
*/
export async function integrityTests(mapview) {
  await workspaceTest(mapview);
  await layerTest(mapview);
}

/**
@global
@name _mappTest
@type {object}
@description
The test plugin imports this bundle for its side effect and reads the suite off
the global.

@property {function} integrityTests - Integrity suites for a deployed instance.
*/
globalThis._mappTest = {
  integrityTests,
};
