import pg from 'pg';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';

describe('devdb', () => {
  const client = new pg.Client({ connectionString: inject('DEVDB') });

  beforeAll(() => client.connect());

  afterAll(() => client.end());

  it('connects to PGlite over the socket server', async () => {
    const { rows } = await client.query('SELECT version()');

    expect(rows[0].version).toMatch(/^PostgreSQL/);
  });

  it('provides the postgis extension', async () => {
    const { rows } = await client.query('SELECT postgis_version()');

    expect(rows[0].postgis_version).toMatch(/^3\./);
  });

  it('seeds the example schema', async () => {
    const { rows } = await client.query(
      `SELECT name
      FROM example.locations
      WHERE ST_DWithin(geom::geography, ST_MakePoint(-0.1276, 51.5072)::geography, $1)
      ORDER BY name`,
      [500000],
    );

    expect(rows.map((row) => row.name)).toEqual(['Geolytix', 'Paris']);
  });

  it('transforms between the seeded srids', async () => {
    const { rows } = await client.query(
      `SELECT f.name
      FROM example.features f, example.locations l
      WHERE l.name = 'Geolytix'
      AND ST_DWithin(f.geom, ST_Transform(l.geom, 3857), 10000)
      ORDER BY f.id`,
    );

    expect(rows.map((row) => row.name)).toEqual([
      'Thames Path',
      'Hyde Park',
      'Unnamed',
    ]);
  });
});
