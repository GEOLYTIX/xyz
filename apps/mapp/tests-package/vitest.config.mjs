import { existsSync, lstatSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// The package test imports @geolytix/mapp from tests-package/node_modules. The workspace link in the repository root node_modules would resolve to the source package, so the test must not run without the installed package.
const installed = fileURLToPath(
  new URL('./node_modules/@geolytix/mapp', import.meta.url),
);

if (!existsSync(installed) || lstatSync(installed).isSymbolicLink()) {
  throw new Error(
    'The packed @geolytix/mapp package is not installed in tests-package/node_modules. Run pnpm pack:check and pnpm pack:install first.',
  );
}

// The testhost serves the XYZ API with the workspace of the library tests.
process.env.TESTHOST_WORKSPACE = fileURLToPath(
  new URL('../tests/workspaces/_workspace.json', import.meta.url),
);

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  // The test runs the published bundle as is, not a dependency prebundle.
  optimizeDeps: {
    exclude: ['@geolytix/mapp'],
  },
  test: {
    include: ['*.test.mjs'],
    globalSetup: ['@geolytix/xyz-testhost/globalSetup'],
    // Loading the PostGIS extension into PGlite takes a few seconds.
    hookTimeout: 60000,
    testTimeout: 10000,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      viewport: { width: 1024, height: 768 },
      screenshotFailures: false,
    },
  },
});
