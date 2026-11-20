import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

// The testhost global setup serves the XYZ API with this workspace.
process.env.TESTHOST_WORKSPACE = fileURLToPath(
  new URL('./tests/workspaces/_workspace.json', import.meta.url),
);

export default defineConfig({
  // The drive letter is uppercased on Windows. The VS Code extension starts Vitest with a lowercase drive letter cwd, eg. c:\. Vite would then serve the lib modules from two urls and the test files would import another module instance than the mapp global.
  root: fileURLToPath(new URL('.', import.meta.url)).replace(
    /^[a-z]:/,
    (drive) => drive.toUpperCase(),
  ),
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
