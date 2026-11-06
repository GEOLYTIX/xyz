import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

// The testhost global setup serves the XYZ API with this workspace.
process.env.TESTHOST_WORKSPACE = fileURLToPath(
  new URL('./tests/workspaces/_workspace.json', import.meta.url),
);

// The module tests are *.test.mjs files. The default view tests are Playwright *.spec.mjs files, see playwright.config.mjs.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  // The MAPP library is imported from the mapp app in the setup.
  server: {
    fs: { allow: [repoRoot] },
  },
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
        statements: 11,
        branches: 9,
        functions: 10,
        lines: 11,
      },
      // The lcov.info is for SonarQube, which resolves the source paths from the repository root.
      reporter: [
        'text',
        'text-summary',
        ['lcovonly', { projectRoot: repoRoot }],
      ],
      reportsDirectory: fileURLToPath(new URL('./coverage', import.meta.url)),
    },
  },
});
