#!/usr/bin/env node

/**
The start script runs a persistent PGlite database with PostGIS on a local port until the process is interrupted.

The database is kept in packages/devdb/data. Delete the data directory to recreate and reseed the database.

@example
pnpm devdb
pnpm devdb --port=5434
*/

import { fileURLToPath } from 'node:url';
import { startDevDb } from './index.js';

const port = Number.parseInt(
  process.argv.find((arg) => arg.startsWith('--port='))?.split('=')[1] ??
    process.env.DEVDB_PORT ??
    5433,
);

const devdb = await startDevDb({
  dataDir: fileURLToPath(new URL('./data', import.meta.url)),
  port,
});

console.log(`PGlite with PostGIS is running on port ${devdb.port}.

Add the connection to your .env, eg:

DBS_DEV=${devdb.connectionString}

Press Ctrl+C to stop.`);

process.on('SIGINT', async () => {
  // The database must be closed to flush the data directory.
  await devdb.stop();
  process.exit(0);
});
