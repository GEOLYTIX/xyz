/**
## @geolytix/xyz-devdb

The devdb module runs a [PGlite]{@link https://pglite.dev} database with the PostGIS extension for testing and coding examples.

PGlite is PostgreSQL compiled to WebAssembly and runs in the Node process. A [pglite-socket]{@link https://www.npmjs.com/package/@electric-sql/pglite-socket} server exposes the database on a TCP port, so node-postgres clients and XYZ `DBS_*` connection strings can connect as they would to a PostgreSQL server.

The package is excluded from Vercel deployments in the .vercelignore and must never be imported by application code.

@requires @electric-sql/pglite
@requires @electric-sql/pglite-postgis
@requires @electric-sql/pglite-socket

@module devdb
*/

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { postgis } from '@electric-sql/pglite-postgis';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const packageDir = dirname(fileURLToPath(import.meta.url));

export const SEED_DIR = join(packageDir, 'seed');

/**
@function startDevDb
@async

@description
The startDevDb method creates a PGlite database with the PostGIS extension and starts a socket server for the database.

The database is kept in memory if no dataDir is provided. A new database is seeded by creating the postgis extension and executing the `*.sql` files in the seed directory in alphabetical order. A dataDir which has been seeded before is not seeded again.

PGlite is a single connection database. The socket server queues the queries from concurrent client connections.

@param {Object} [options]
@property {string} [options.dataDir] Directory to persist the database. The database is in memory if undefined.
@property {number} [options.port] Port for the socket server. A free port is assigned if 0.
@property {string|false} [options.seed] Directory with *.sql seed files, or false to skip the seed files.
@property {number} [options.maxConnections] Maximum concurrent client connections.
@returns {Promise<Object>} The connectionString, port, db instance, and a stop method.
*/
export async function startDevDb({
  dataDir,
  port = 5433,
  seed = SEED_DIR,
  maxConnections = 20,
} = {}) {
  const seeded = dataDir && existsSync(join(dataDir, 'PG_VERSION'));

  const db = await PGlite.create({ dataDir, extensions: { postgis } });

  if (!seeded) await seedDatabase(db, seed);

  const server = new PGLiteSocketServer({
    db,
    port,
    host: '127.0.0.1',
    maxConnections,
  });

  await server.start();

  // The server connection is host:port once the server is listening.
  const assignedPort = Number(server.getServerConn().split(':').pop());

  return {
    connectionString: `postgres://postgres:postgres@127.0.0.1:${assignedPort}/postgres`,
    port: assignedPort,
    db,
    stop: async () => {
      await server.stop();
      await db.close();
    },
  };
}

/**
@function seedDatabase
@async

@description
The seedDatabase method creates the postgis extension and executes the `*.sql` files in the seed directory in alphabetical order.

@param {PGlite} db The database to seed.
@param {string|false} seed Directory with *.sql seed files.
*/
async function seedDatabase(db, seed) {
  await db.exec('CREATE EXTENSION IF NOT EXISTS postgis;');

  if (!seed) return;

  const files = (await readdir(seed)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    await db.exec(await readFile(join(seed, file), 'utf8'));
  }
}
