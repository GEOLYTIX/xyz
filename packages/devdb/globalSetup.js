/**
The globalSetup module starts an in memory PGlite database with PostGIS on a free port for a Vitest run.

The connection string is provided to test files as `inject('DEVDB')` and assigned to process.env.DEVDB for modules which read the environment.

The database is discarded at the end of the run.

@example
// vitest.config.mjs
export default defineConfig({
  test: {
    globalSetup: ['@geolytix/xyz-devdb/globalSetup'],
  },
});

@module devdb/globalSetup
*/

import { startDevDb } from './index.js';

export default async function setup(project) {
  const devdb = await startDevDb({ port: 0 });

  process.env.DEVDB = devdb.connectionString;
  project.provide('DEVDB', devdb.connectionString);

  return devdb.stop;
}
