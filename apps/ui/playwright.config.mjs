import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

// The testhost for the UI tests. The port must differ from a testhost started with pnpm testview.
const port = Number(process.env.UI_TESTHOST_PORT ?? 3101);

const testhost = fileURLToPath(
  new URL('../../packages/testhost/server.js', import.meta.url),
);

// The testhost serves the XYZ API with this workspace.
const workspace = fileURLToPath(
  new URL('./tests/workspaces/_workspace.json', import.meta.url),
);

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  // The tests run in one worker. With parallel pages, closing an HTTP socket in the testhost blocks the Node process for about 7s on Windows, which stalls the page loads of the other workers until the tests time out.
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Starts one testhost with the devdb for the test run.
  webServer: {
    command: `node "${testhost}" --port=${port} --workspace="${workspace}"`,
    url: `http://127.0.0.1:${port}/api/workspace/locales`,
    reuseExistingServer: !process.env.CI,
    // Loading the PostGIS extension into PGlite takes a few seconds.
    timeout: 60000,
  },
});
