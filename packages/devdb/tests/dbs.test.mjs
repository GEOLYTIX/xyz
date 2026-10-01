import { beforeAll, describe, expect, inject, it } from 'vitest';

describe('xyz dbs module', () => {
  let dbs;

  beforeAll(async () => {
    // The dbs module creates a pool for each DBS_* key in the xyzEnv on import.
    globalThis.xyzEnv = { DBS_DEVDB: inject('DEVDB') };

    ({ default: dbs } = await import('../../../apps/xyz/mod/utils/dbs.js'));
  });

  it('queries PGlite through a DBS connection', async () => {
    const rows = await dbs.DEVDB(
      'SELECT name, ST_AsGeoJSON(geom)::json AS geom FROM example.locations WHERE name = $1',
      ['Berlin'],
      5000,
    );

    expect(rows).toEqual([
      { name: 'Berlin', geom: { type: 'Point', coordinates: [13.405, 52.52] } },
    ]);
  });

  it('runs concurrent queries from the pool', async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        dbs.DEVDB('SELECT $1::int AS i', [i]),
      ),
    );

    expect(results.map(([row]) => row.i)).toEqual([...Array(10).keys()]);
  });
});
