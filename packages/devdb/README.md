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
| `geodata.uk_glx_open_retail_points` | `100_retailpoints.sql` | 19,229 grocery stores in EPSG:4326 from the [GEOLYTIX UK Retail Points](https://geolytix.com/blog/supermarket-retail-points/) v49 (2026-09), Open Data CC0. The `geom_p_4326` points are rounded to 6 decimals. |

### Adding vector datasets

Larger vector datasets, eg. from [Natural Earth](https://www.naturalearthdata.com/) (public domain), go into their own schema and numbered seed files, eg. `100_naturalearth_countries.sql` for `naturalearth.countries`.

- Every test run seeds a new in-memory database, so the seed size adds to the start of every run. Prefer the 1:110m or 1:50m scale and only the columns the tests need.
- Write the seed with `INSERT` statements. The seed files are executed with `db.exec()`, which doesn't read `COPY ... FROM stdin` data. With GDAL, eg. `ogr2ogr -f PGDump -lco SCHEMA=naturalearth -lco CREATE_SCHEMA=OFF --config PG_USE_COPY NO 100_naturalearth_countries.sql ne_110m_admin_0_countries.shp`, and create the schema in the first seed file of the dataset.
- Add the table to the seed table above with its geometry type and SRID.

## Use in tests

A test file starts an in-memory database on a free port with `startDevDb({ port: 0 })` and stops it after the tests, eg. [query.test.mjs](../../apps/xyz/tests/mod/query.test.mjs):

```js
import { afterAll } from 'vitest';
import { startDevDb } from '../../../../packages/devdb/index.js';

const devdb = await startDevDb({ port: 0 });

afterAll(() => devdb.stop());
```

The XYZ `dbs` module connects to the database with the connection string as a `DBS_*` environment variable, eg. `DBS_DEVDB: devdb.connectionString`.

The MAPP library tests use the database through the [testhost](../testhost/README.md), which starts the devdb with the XYZ API.

`apps/xyz/tests` imports `index.js` by relative path. Don't declare `@geolytix/xyz-devdb` as a dependency of `apps/xyz`. Vercel installs the xyz app without the devdb package, which is excluded in the `.vercelignore`.

## Limitations

- PGlite is a single-connection database. The socket server accepts up to 20 client connections and runs their queries one at a time.
- `@electric-sql/pglite-postgis` is marked experimental by its authors.
- PGlite is not a full PostgreSQL server. Roles, passwords and some extensions differ from production, so treat it as a fixture database, not a production replica.
