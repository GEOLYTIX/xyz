import { createMocks } from 'node-mocks-http';
import { afterAll, describe, expect, it } from 'vitest';
import { startDevDb } from '../../../../../packages/devdb/index.js';
import { fieldsArray as mappFieldsArray } from '../../../../mapp/lib/layer/featureFields.mjs';
import { mockConsole } from '../../scaffold.mjs';

/**
 * ## Workspace integrity tests
 *
 * The layers in tests/assets/integrity_workspace.json are checked against the PGlite PostGIS database from packages/devdb.
 *
 * | layer             | expected                                         |
 * |-------------------|--------------------------------------------------|
 * | features_mvt      | valid                                            |
 * | missing_column    | wkt errors for the turnover and field_and_fields |
 * | missing_table     | one mvt error for the zoom 12 and 14 table       |
 * | bad_fieldfx       | location_get error for an invalid fieldfx        |
 * | data_fieldfx      | valid, the fieldfx only fails on location values |
 * | unknown_dbs       | dbs validation error                             |
 * | missing_geom      | wkt error for the zoom 10 geoms column           |
 * | multi_statement   | params.template with two statements is rejected  |
 * | uuid_qid          | valid, location_get with a uuid qID              |
 * | no_table          | infoj without a table is not checked             |
 * | bad.key           | getLayer error, the layer is not composed        |
 * | basemap           | tiles format is not checked                      |
 * | locations_geojson | valid, in the berlin locale nested in europe     |
 *
 * @module mod/workspace/integrity
 */

const devdb = await startDevDb({ port: 0 });

afterAll(() => devdb.stop());

// The dbs module creates the connection pools from the xyzEnv on import.
globalThis.xyzEnv = {
  TITLE: 'INTEGRITY TEST',
  WORKSPACE: 'file:./tests/assets/integrity_workspace.json',
  STATEMENT_TIMEOUT: '5000',
  DBS_DEVDB: devdb.connectionString,
};

const { default: getKeyMethod } = await import(
  '../../../mod/workspace/_workspace.js'
);
const { default: checkWorkspaceCache } = await import(
  '../../../mod/workspace/cache.js'
);
const { fieldsArray, statementCount } = await import(
  '../../../mod/workspace/integrity.js'
);
const { default: dbs } = await import('../../../mod/utils/dbs.js');

await dbs.DEVDB({
  query:
    'CREATE TABLE example.uuid_locations (id uuid PRIMARY KEY, name text, geom geometry(Point, 4326))',
});

await checkWorkspaceCache(true);

// Suppress errors logged by the query and dbs modules.
mockConsole('error');

// Messages logged to the console.
const logs = mockConsole('log');

const admin = { admin: true };

/**
 * Sends a request with params to the workspace test method.
 * @returns {Promise<{status: number, data: *}>} The response status and data.
 */
async function request(params) {
  const { req, res } = createMocks({ params: { key: 'test', ...params } });

  await getKeyMethod(req, res);

  return { status: res.statusCode, data: res._getData() };
}

describe('Workspace test: layers', () => {
  it('requires admin credentials', async () => {
    expect((await request({ layers: true })).status).toBe(403);
  });

  it('does not check layers without the layers param', async () => {
    const { data } = await request({ user: admin });

    expect(Object.keys(data)).toEqual([
      'srcErr',
      'templateWarn',
      'negatedRoles',
    ]);
  });

  it('checks every layer once', async () => {
    const { data } = await request({ layers: true, user: admin });

    // 12 europe layers and 1 berlin layer. The europe layers inherited by the nested berlin locale are not checked again.
    expect(data.layers.checked).toBe(13);
    expect(data.layers.failed).toBe(7);

    expect(data.layers.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          locale: 'europe',
          layer: 'missing_column',
          template: 'wkt',
          table: 'example.locations',
          themes: ['turnover'],
          error: 'column "turnover" does not exist',
        }),
        // The theme.field and theme.fields are both requested.
        expect.objectContaining({
          locale: 'europe',
          layer: 'missing_column',
          template: 'wkt',
          table: 'example.locations',
          themes: ['field_and_fields'],
          error: 'column "footfall" does not exist',
        }),
        expect.objectContaining({
          locale: 'europe',
          layer: 'missing_table',
          template: 'mvt',
          table: 'example.missing_table',
          error: 'relation "example.missing_table" does not exist',
        }),
        expect.objectContaining({
          locale: 'europe',
          layer: 'bad_fieldfx',
          template: 'location_get',
          error: 'operator does not exist: text + integer',
        }),
        expect.objectContaining({
          locale: 'europe',
          layer: 'unknown_dbs',
          template: 'wkt',
          table: 'example.locations',
          error: 'Failed to validate database connection method.',
        }),
        // The geoms column for zoom level 10 and above.
        expect.objectContaining({
          locale: 'europe',
          layer: 'missing_geom',
          template: 'wkt',
          table: 'example.locations',
          error: 'column "missing_geom" does not exist',
        }),
        expect.objectContaining({
          locale: 'europe',
          layer: 'multi_statement',
          template: 'multi_statement',
          table: 'example.locations',
          error:
            'The query has multiple statements and can not be checked with EXPLAIN.',
        }),
      ]),
    );
  });

  it('checks a table for multiple zoom levels once', async () => {
    const { data } = await request({
      layers: true,
      layer: 'missing_table',
      user: admin,
    });

    // The example.missing_table is referenced for zoom levels 12 and 14.
    expect(data.layers.errors).toHaveLength(1);
  });

  it('checks location_get for a uuid qID', async () => {
    const { data } = await request({
      layers: true,
      layer: 'uuid_qid',
      user: admin,
    });

    expect(data.layers.errors).toEqual([]);
  });

  it('does not execute a statement after the first statement', async () => {
    await dbs.DEVDB({
      query: 'INSERT INTO example.log (msg) VALUES ($1)',
      variables: ['integrity'],
    });

    await request({ layers: true, layer: 'multi_statement', user: admin });

    const [{ count }] = await dbs.DEVDB({
      query: 'SELECT count(*)::int AS count FROM example.log',
    });

    expect(count).toBe(1);
  });

  it('executes the EXPLAIN query in a read only transaction', async () => {
    const err = await dbs.DEVDB({
      query: 'SELECT 1; DELETE FROM example.log',
      readOnly: true,
    });

    expect(err.message).toBe(
      'cannot execute DELETE in a read-only transaction',
    );
  });

  it('does not read locations from the layer table', async () => {
    const { data } = await request({
      layers: true,
      layer: 'data_fieldfx',
      user: admin,
    });

    // The name::numeric fieldfx fails only for a location since every name in the table is text.
    expect(data.layers.errors).toEqual([]);
  });

  it('returns the timing of the check and the failed layers', async () => {
    const { data } = await request({ layers: true, user: admin });

    const { layers } = data;

    expect(Object.keys(layers)).toEqual([
      'start',
      'end',
      'duration_ms',
      'checked',
      'failed',
      'failed_layers',
      'errors',
    ]);

    expect(Date.parse(layers.end) - Date.parse(layers.start)).toBe(
      layers.duration_ms,
    );

    // Only failed layers are returned in the order of the layers in the workspace.
    expect(layers.failed_layers.map(({ layer }) => layer)).toEqual([
      'missing_column',
      'missing_table',
      'bad_fieldfx',
      'unknown_dbs',
      'missing_geom',
      'multi_statement',
      'bad.key',
    ]);

    for (const failed of layers.failed_layers) {
      expect(Object.keys(failed)).toEqual([
        'locale',
        'layer',
        'start',
        'end',
        'duration_ms',
      ]);
      expect(Date.parse(failed.end) - Date.parse(failed.start)).toBe(
        failed.duration_ms,
      );
      expect(Date.parse(failed.start)).toBeGreaterThanOrEqual(
        Date.parse(layers.start),
      );
      expect(Date.parse(failed.end)).toBeLessThanOrEqual(
        Date.parse(layers.end),
      );
    }
  });

  it('does not log to the console', async () => {
    const from = logs.length;

    await request({ layers: true, user: admin });

    expect(logs.slice(from)).toEqual([]);
  });

  it('checks the layers of a locale', async () => {
    const { data } = await request({
      layers: true,
      locale: 'berlin',
      user: admin,
    });

    expect(data.layers).toEqual(
      expect.objectContaining({
        checked: 1,
        failed: 0,
        errors: [],
      }),
    );
  });

  it('checks the layers of a nested locale', async () => {
    const { data } = await request({
      layers: true,
      locale: ['europe', 'berlin'],
      user: admin,
    });

    expect(data.layers.checked).toBe(13);
    expect(
      data.layers.errors.every((err) => err.locale === 'europe,berlin'),
    ).toBe(true);
  });

  it('checks a single layer', async () => {
    const { data } = await request({
      layers: true,
      layer: 'missing_column',
      user: admin,
    });

    expect(data.layers.checked).toBe(1);
    expect(data.layers.errors).toHaveLength(2);
  });

  it('returns the getLayer error for a layer which is not composed', async () => {
    const { data } = await request({
      layers: true,
      locale: 'europe',
      layer: 'bad.key',
      user: admin,
    });

    expect(data.layers.checked).toBe(1);
    expect(data.layers.failed).toBe(1);
    expect(data.layers.errors).toEqual([
      {
        locale: 'europe',
        layer: 'bad.key',
        template: 'getLayer',
        error:
          'The layer [key] property may only contain whitelisted character [^a-zA-Z0-9 :_-]',
      },
    ]);
  });

  it('returns an error for a locale which is not found', async () => {
    const { data } = await request({
      layers: true,
      locale: 'Europe',
      user: admin,
    });

    expect(data.layers.checked).toBe(0);
    expect(data.layers.errors).toEqual([
      {
        locale: 'Europe',
        error: 'Locale not found. Locale keys: europe | europe,berlin | berlin',
      },
    ]);
  });

  it('returns an error for a layer which is not found', async () => {
    const { data } = await request({
      layers: true,
      locale: 'europe',
      layer: 'missing_layer',
      user: admin,
    });

    expect(data.layers.checked).toBe(0);
    expect(data.layers.errors).toEqual([
      {
        locale: 'europe',
        layer: 'missing_layer',
        error: 'Layer not found in the locale layers.',
      },
    ]);
  });
});

describe('Workspace integrity: statementCount', () => {
  it.each([
    ['a single statement', 'SELECT 1', 1],
    ['a trailing semicolon', 'SELECT 1;\n', 1],
    ['two statements', 'SELECT 1; DELETE FROM t', 2],
    ['a semicolon in a string', "SELECT 'a;b'", 1],
    ['an escaped quote in a string', "SELECT 'it''s; fine'", 1],
    ['a semicolon in an identifier', 'SELECT 1 AS "a;b"', 1],
    ['a semicolon in a dollar quote', 'SELECT $tag$a;b$tag$', 1],
    ['a semicolon in a line comment', 'SELECT 1 -- a; b\n', 1],
    ['a semicolon in a block comment', 'SELECT 1 /* a; b */', 1],
  ])('counts %s', (_, query, count) => {
    expect(statementCount(query)).toBe(count);
  });
});

describe('Workspace integrity: fieldsArray', () => {
  it.each([
    ['a layer without style', { params: {}, style: {} }],
    [
      'a theme field with label, hover, and icon_scaling fields',
      {
        params: { default_fields: ['id', 'name'] },
        style: {
          theme: { field: 'category' },
          label: { field: 'name' },
          hover: { field: 'hover' },
          icon_scaling: { field: 'size' },
        },
      },
    ],
    [
      'theme fields with a cluster label',
      {
        params: {},
        style: { theme: { fields: ['a', 'b', 'a'] } },
        cluster: { label: 'count' },
      },
    ],
  ])('matches the mapp fieldsArray for %s', (_, layer) => {
    expect(fieldsArray(layer, layer.style.theme)).toEqual(
      mappFieldsArray(layer),
    );
  });
});
