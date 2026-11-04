import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

// The testhost global setup serves the XYZ API with this workspace.
process.env.TESTHOST_WORKSPACE = fileURLToPath(
  new URL('./tests/workspaces/_workspace.json', import.meta.url),
);

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    include: ['tests/**/*.test.mjs'],
    setupFiles: ['tests/setup.mjs'],
    // Starts the devdb and the XYZ host once for the run.
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
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.mjs'],
      // The coverage floor. Raise the thresholds with new tests.
      thresholds: {
        statements: 47,
        branches: 47,
        functions: 45,
        lines: 46,
      },
      // Sonar resolves the lcov source paths from the repository root.
      reporter: ['text', 'text-summary', ['lcov', { projectRoot: repoRoot }]],
      // The xyz coverage cleans the root coverage directory.
      reportsDirectory: fileURLToPath(new URL('./coverage', import.meta.url)),
    },
  },
});
