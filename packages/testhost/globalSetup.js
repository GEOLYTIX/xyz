/**
The globalSetup module starts a testhost with an in-memory devdb database on a free port for a Vitest run.

The workspace is read from the `TESTHOST_WORKSPACE` environment variable, an absolute path or a path relative to the current working directory. A Vitest config can set the variable before the global setup runs.

The host url is provided to test files as `inject('XYZ_HOST')` and assigned to process.env.XYZ_HOST. The host allows cross-origin requests, so browser tests can request the API from the Vitest page origin. The devdb connection string is provided as `inject('DEVDB')`.

The host and database are stopped at the end of the run.

@example
// vitest.config.mjs
process.env.TESTHOST_WORKSPACE = fileURLToPath(new URL('./tests/workspaces/_workspace.json', import.meta.url));

export default defineConfig({
  test: {
    globalSetup: ['@geolytix/xyz-testhost/globalSetup'],
  },
});

@module testhost/globalSetup
*/

import { resolve } from 'node:path';
import { startHost } from './index.js';

// Vitest runs the global setup for each project, eg. the root project and a browser instance. The projects share one host.
let hostPromise;
let projects = 0;

/**
@function setup
@async

@description
The setup method starts the testhost for the first project and provides the host url and devdb connection string to each Vitest project.

The host is stopped by the teardown of the last project.

@param {TestProject} project The Vitest test project.
@returns {Promise<Function>} The teardown method which stops the host and database after the last project.
*/
export default async function setup(project) {
  hostPromise ??= startHost({
    port: 0,
    // The Vitest browser page is served from a different origin.
    cors: true,
    workspace: process.env.TESTHOST_WORKSPACE
      ? resolve(process.env.TESTHOST_WORKSPACE)
      : undefined,
  });

  projects++;

  const host = await hostPromise;

  process.env.XYZ_HOST = host.url;
  process.env.DEVDB = host.devdb.connectionString;

  project.provide('XYZ_HOST', host.url);
  project.provide('DEVDB', host.devdb.connectionString);

  return async () => {
    if (--projects === 0) await host.stop();
  };
}
