import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

// The testhost global setup serves the XYZ API with this workspace.
process.env.TESTHOST_WORKSPACE = fileURLToPath(
  new URL('./tests/workspaces/_workspace.json', import.meta.url),
);

// The Mapbox tests need an access token. The token is read from the environment, or from a gitignored .env.local or .env.test.local file in the repository root. The tests are skipped without a token.
const env = loadEnv('test', repoRoot, 'MAPBOX_');

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    include: ['tests/**/*.test.mjs'],
    setupFiles: ['tests/setup.mjs'],
    // Provided to the browser tests as inject('MAPBOX_ACCESS_TOKEN') and inject('MAPBOX_STYLE_URL').
    provide: {
      MAPBOX_ACCESS_TOKEN: env.MAPBOX_ACCESS_TOKEN ?? '',
      MAPBOX_STYLE_URL: env.MAPBOX_STYLE_URL ?? '',
    },
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
      // The uhtml module is a minified third party library.
      exclude: ['lib/utils/uhtml.mjs'],
      // The coverage floor. Raise the thresholds with new tests.
      thresholds: {
        statements: 65,
        branches: 66,
        functions: 64,
        lines: 65,
      },
      // The lcov.info is for SonarQube, which resolves the source paths from the repository root.
      // The VS Code extension shows the coverage in the editor.
      reporter: [
        'text',
        'text-summary',
        ['lcovonly', { projectRoot: repoRoot }],
      ],
      // The xyz coverage cleans the root coverage directory.
      reportsDirectory: fileURLToPath(new URL('./coverage', import.meta.url)),
    },
  },
});
