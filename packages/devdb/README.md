# @geolytix/xyz-devdb

Local PostgreSQL with PostGIS for testing and coding examples, using [PGlite](https://pglite.dev) with the [PostGIS extension](https://www.npmjs.com/package/@electric-sql/pglite-postgis).

PGlite is PostgreSQL compiled to WebAssembly and runs inside Node, so you don't need Docker, a system install or native binaries. A [pglite-socket](https://www.npmjs.com/package/@electric-sql/pglite-socket) server exposes it on a TCP port, so `pg` clients and XYZ `DBS_*` connection strings work unchanged.

The package is listed in `.vercelignore`. Vercel never sees the directory, so pnpm on Vercel does not install PGlite. Application code under `apps/` must never import it.

## Run a local database

```bash
pnpm devdb                # port 5433
pnpm devdb --port=5434
```

The script prints a connection string to add to your `.env`, eg:

```env
DBS_DEV=postgres://postgres:postgres@127.0.0.1:5433/postgres
```

The database persists in `packages/devdb/data` (gitignored). Stop it with Ctrl+C so the data is flushed. Delete the data directory to recreate and reseed.

## Seed data

A new database creates the `postgis` extension and then runs the `*.sql` files in [seed/](seed/) in alphabetical order. Add numbered files for more fixtures. Tests depend on the seeded rows, so add new tables or rows rather than changing existing ones.

| Table | Seed | Contents |
|---|---|---|
| `example.locations` | `001_example.sql` | 4 points in EPSG:4326 (London, Paris, Berlin, Madrid) |
| `example.features` | `002_features.sql` | A line, a polygon and points in EPSG:3857, plus a row with a null category and a row with a null geometry |
| `example.log` | `002_features.sql` | An empty table for insert queries |

## Use in Vitest

`globalSetup.js` starts an in-memory database on a free port for the run and discards it afterwards:

```js
// vitest.config.mjs
export default defineConfig({
  test: {
    include: ['./tests/**/*.test.mjs'],
    globalSetup: ['./globalSetup.js'],
    hookTimeout: 60000,
  },
});
```

```js
import pg from 'pg';
import { inject } from 'vitest';

const client = new pg.Client({ connectionString: inject('DEVDB') });
```

The connection string is also set as `process.env.DEVDB`. [tests/dbs.test.mjs](tests/dbs.test.mjs) shows XYZ's `mod/utils/dbs.js` querying the database through a `DBS_` connection.

```bash
pnpm test:devdb
```

Tests in `apps/xyz/tests` can also start a database by importing `index.js` by relative path, eg. the `wkt` template tests in [query.test.mjs](../../apps/xyz/tests/mod/query.test.mjs). `apps/xyz/tests` is excluded from Vercel too. Don't declare `@geolytix/xyz-devdb` as a dependency of an app, though. That would break installs on Vercel, where the package is absent.

## Limitations

- PGlite is a single-connection database. The socket server accepts up to 20 client connections and runs their queries one at a time.
- `@electric-sql/pglite-postgis` is marked experimental by its authors.
- PGlite is not a full PostgreSQL server. Roles, passwords and some extensions differ from production, so treat it as a fixture database, not a production replica.
