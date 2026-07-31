import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/**
Two projects for the MAPP browser library, one coverage report.

  lib      happy-dom   tests/lib/**       values and DOM structure
  browser  chromium    tests/browser/**   code that needs a rendering engine

`tests/integrity/**` is deliberately matched by neither. Those tests assert that
a deployed instance's workspace, layers and database connections resolve, which
is a property of a running deployment rather than of the source. They are the
only suite still on codi, are bundled by the Vite build, and still run in the
browser through the test plugin. See TESTING.md.
*/

const rootDir = fileURLToPath(new URL('.', import.meta.url));

// The suite reads fixtures that live outside this package: the dictionaries
// under `public/`, the root `package.json`, and the shared infoj fixtures under
// `apps/xyz/tests/assets`. Vite serves the browser project over HTTP and
// refuses paths outside its root unless they are allowed explicitly.
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig({
  root: rootDir,
  test: {
    projects: [
      {
        root: rootDir,
        test: {
          name: 'lib',
          environment: 'happy-dom',
          include: ['tests/lib/**/*.test.mjs'],
          setupFiles: ['tests/lib/setup.mjs'],
        },
      },
      {
        root: rootDir,
        server: {
          fs: {
            allow: [repoRoot],
          },
        },
        test: {
          name: 'browser',
          include: ['tests/browser/**/*.test.mjs'],
          setupFiles: ['tests/browser/setup.mjs'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
    testTimeout: 10000,
    fileParallelism: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['lib/**'],

      exclude: [
        // Vendored third party bundle. Including it distorts the lib figure
        // without saying anything about our own code.
        'lib/utils/uhtml.mjs',

        // The include above is not anchored and also matches `tests/lib/**`,
        // which would put the harness stubs in the report.
        //
        // The leading `**/` is required. A bare `tests/**` here excludes every
        // file and the report comes back as 0/0.
        '**/tests/**',
      ],
    },
  },
});
