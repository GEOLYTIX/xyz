import { createMocks } from 'node-mocks-http';
import { afterAll, describe, expect, it } from 'vitest';
import { startDevDb } from '../../../../packages/devdb/index.js';
import { mockConsole } from '../scaffold.mjs';

/**
 * ## Query Tests
 *
 * The query module is tested against the PGlite PostGIS database from packages/devdb.
 *
 * The workspace templates and layers in tests/assets/query_workspace.json query the seeded tables.
 *
 * example.locations with EPSG:4326 points:
 *
 * | id | name     | category |
 * |----|----------|----------|
 * | 1  | Geolytix | office   |
 * | 2  | Paris    | city     |
 * | 3  | Berlin   | city     |
 * | 4  | Madrid   | city     |
 *
 * example.features with EPSG:3857 geometries in London and Berlin:
 *
 * | id | name             | category | geom       |
 * |----|------------------|----------|------------|
 * | 1  | Thames Path      | path     | LineString |
 * | 2  | Hyde Park        | park     | Polygon    |
 * | 3  | Unnamed          | NULL     | Point      |
 * | 4  | Lost Park        | park     | NULL       |
 * | 5  | Brandenburg Gate | landmark | Point      |
 *
 * example.log is a writable table.
 *
 * @module mod/query
 */

const devdb = await startDevDb({ port: 0 });

afterAll(() => devdb.stop());

// The dbs module creates the connection pools from the xyzEnv on import.
globalThis.xyzEnv = {
  TITLE: 'QUERY TEST',
  WORKSPACE: 'file:./tests/assets/query_workspace.json',
  STATEMENT_TIMEOUT: '5000',
  DBS_DEVDB: devdb.connectionString,
  // Nothing listens on port 1, so connections are refused.
  DBS_OFFLINE: 'postgres://postgres@127.0.0.1:1/postgres',
};

const { default: query } = await import('../../mod/query.js');
const { default: checkWorkspaceCache } = await import(
  '../../mod/workspace/cache.js'
);

await checkWorkspaceCache(true);

// Suppress errors logged by the query, dbs, and sqlFilter modules.
const mockErrors = mockConsole('error');

/**
 * Sends a request with params [and body] to the query module.
 * @returns {Promise<{status: number, data: *}>} The response status and data.
 */
async function request(params, body) {
  const { req, res } = createMocks({ params, body });

  await query(req, res);

  return { status: res.statusCode, data: res._getData() };
}

describe('Query: template access', () => {
  it.each([
    ['a missing template', { template: 'missing_template' }, 400],
    ['an admin template without admin', { template: 'admin_only' }, 401],
    [
      'a role restricted template without role',
      { template: 'role_restricted' },
      400,
    ],
    ['a layer template without layer', { template: 'location_get' }, 400],
    [
      'a template without template string',
      { template: 'no_template_string' },
      400,
    ],
  ])('rejects %s', async (_, params, status) => {
    expect((await request(params)).status).toBe(status);
  });

  it.each([
    ['admin', { admin: true }, 'admin_only', 'admin'],
    ['role', { roles: ['analyst'] }, 'role_restricted', 'analyst'],
  ])(
    'permits a %s template for a user with access',
    async (_, user, template, access) => {
      expect(await request({ template, user })).toEqual({
        status: 200,
        data: { access },
      });
    },
  );
});

describe('Query: dbs connection', () => {
  it('returns 400 for a dbs which is not a DBS_* connection', async () => {
    expect(await request({ template: 'bogus_dbs' })).toEqual({
      status: 400,
      data: 'Failed to validate database connection method.',
    });
  });

  it('uses the workspace dbs by default', async () => {
    expect((await request({ template: 'simple_select' })).data).toEqual({
      greeting: 'hello',
    });
  });

  it('uses the template dbs over the layer dbs', async () => {
    const res = await request({ template: 'template_dbs', layer: 'offline' });

    expect(res).toEqual({ status: 200, data: { dbs: 'template' } });
  });

  it('uses the layer dbs over the workspace dbs', async () => {
    const res = await request({ template: 'layer_dbs', layer: 'offline' });

    // The connection to the OFFLINE layer dbs is refused.
    expect(res.status).toBe(500);
  });
});

describe('Query: layer queries', () => {
  it('returns the infoj fields for a location', async () => {
    const res = await request({
      template: 'location_get',
      layer: 'locations',
      table: 'example.locations',
      id: '2',
    });

    // The infoj entry with a query is not selected.
    expect(res).toEqual({
      status: 200,
      data: {
        id: 2,
        name: 'Paris',
        category: 'city',
        name_upper: 'PARIS',
        name_length: 5,
      },
    });
  });

  it('restricts the infoj fields to the fields param', async () => {
    const res = await request({
      template: 'location_get',
      layer: 'locations',
      table: 'example.locations',
      id: '2',
      fields: 'name',
    });

    expect(res.data).toEqual({ id: 2, name: 'Paris' });
  });

  it('loads a layer from the layer_template param', async () => {
    const res = await request({
      template: 'location_get',
      layer_template: 'template_layer',
      table: 'example.locations',
      id: '3',
    });

    expect(res.data).toEqual({ id: 3, name: 'Berlin' });
  });

  it('returns the wkt geometry and fields for all locations', async () => {
    const res = await request({
      template: 'wkt',
      layer: 'locations',
      table: 'example.locations',
      fields: 'name,category',
    });

    // The wkt template reduces rows to [id, geometry, ...fields] arrays.
    expect(res).toEqual({
      status: 200,
      data: [
        [1, 'POINT(-0.1276 51.5072)', 'Geolytix', 'office'],
        [2, 'POINT(2.3522 48.8566)', 'Paris', 'city'],
        [3, 'POINT(13.405 52.52)', 'Berlin', 'city'],
        [4, 'POINT(-3.7038 40.4168)', 'Madrid', 'city'],
      ],
    });
  });

  it('applies the viewport and filter params', async () => {
    const res = await request({
      template: 'wkt',
      layer: 'locations',
      table: 'example.locations',
      fields: 'name',
      // The viewport covers London and Paris.
      viewport: '-5,45,5,55,4326',
      filter: JSON.stringify({ category: { match: 'city' } }),
    });

    expect(res.data).toEqual([[2, 'POINT(2.3522 48.8566)', 'Paris']]);
  });

  it('applies the default layer filter and checks the layer tables', async () => {
    // The table is referenced in the cities layer tables.
    // The cluster label and style theme fields are accessible fields.
    const res = await request({
      template: 'wkt',
      layer: 'cities',
      table: 'example.locations',
      fields: 'name_upper,category',
    });

    // The name_upper field is replaced with the field of the name_upper template.
    expect(res.data).toEqual([
      [2, 'POINT(2.3522 48.8566)', 'PARIS', 'city'],
      [3, 'POINT(13.405 52.52)', 'BERLIN', 'city'],
      [4, 'POINT(-3.7038 40.4168)', 'MADRID', 'city'],
    ]);
  });

  it('returns only the id and wkt geometry without fields param', async () => {
    // The infoj entry referencing the core distinct_values template is mapped to its field.
    const res = await request({
      template: 'wkt',
      layer: 'cities',
      table: 'example.locations',
      viewport: '10,50,15,55,4326',
    });

    expect(res.data).toEqual([[3, 'POINT(13.405 52.52)']]);
  });

  it('returns lines, polygons, and points but no null geometries', async () => {
    const res = await request({
      template: 'wkt',
      layer: 'features',
      table: 'example.features',
      fields: 'name',
    });

    // Lost Park has no geometry.
    expect(res.data).toEqual([
      [1, 'LINESTRING(-20000 6710000,-10000 6712000)', 'Thames Path'],
      [
        2,
        'POLYGON((-19000 6711000,-18000 6711000,-18000 6712000,-19000 6712000,-19000 6711000))',
        'Hyde Park',
      ],
      [3, 'POINT(-15000 6711500)', 'Unnamed'],
      [5, 'POINT(1492000 6894000)', 'Brandenburg Gate'],
    ]);
  });

  it('transforms the viewport into the layer srid', async () => {
    // The EPSG:4326 viewport covers London, but not Berlin.
    const res = await request({
      template: 'wkt',
      layer: 'features',
      table: 'example.features',
      viewport: '-1,51,1,52,4326',
    });

    expect(res.data.map(([id]) => id)).toEqual([1, 2, 3]);
  });

  it('filters for null field values', async () => {
    const res = await request({
      template: 'wkt',
      layer: 'features',
      table: 'example.features',
      fields: 'name',
      filter: JSON.stringify({ category: { null: true } }),
    });

    expect(res.data).toEqual([[3, 'POINT(-15000 6711500)', 'Unnamed']]);
  });

  it.each([
    ['a layer which is not in the locale', { layer: 'missing_layer' }, 400],
    [
      'a table which is not in the layer',
      { layer: 'locations', table: 'example.users' },
      403,
    ],
    [
      'a viewport on a layer without geom',
      { layer: 'no_geom', viewport: '-5,45,5,55,4326' },
      400,
    ],
    [
      'a field which is not in the layer',
      { layer: 'locations', fields: 'password' },
      400,
    ],
  ])('rejects %s', async (_, params, status) => {
    const res = await request({
      template: 'wkt',
      table: 'example.locations',
      ...params,
    });

    expect(res.status).toBe(status);
  });
});

describe('Query: parameter substitution', () => {
  it('replaces ${} params and substitutes %{} params', async () => {
    const res = await request({
      template: 'param_query',
      field: 'category',
      table: 'example.locations',
      name: 'Geolytix',
    });

    expect(res.data).toEqual({ category: 'office' });
  });

  it.each([
    [
      'a ${} param with characters which are not whitelisted',
      {
        template: 'param_query',
        field: 'name; DROP TABLE example.locations;--',
        table: 'example.locations',
        name: 'Paris',
      },
    ],
    ['missing params', { template: 'param_query' }],
    [
      'an invalid sqlFilter value',
      {
        template: 'filter_query',
        sqlFilter: JSON.stringify({ id: { eq: 'one' } }),
      },
    ],
  ])('returns 400 for %s', async (_, params) => {
    expect((await request(params)).status).toBe(400);
  });

  it('substitutes %{body.*} params from the request body', async () => {
    const res = await request({ template: 'body_query' }, { name: 'Madrid' });

    expect(res.data).toEqual({ name: 'Madrid' });
  });

  it('substitutes the stringified body as %{body}', async () => {
    const res = await request(
      { template: 'stringify_body_query', stringifyBody: true },
      { name: 'Madrid' },
    );

    expect(res.data).toEqual({ name: 'Madrid' });
  });

  it('replaces the wildcard character with %', async () => {
    const res = await request({
      template: 'like_query',
      name: 'Ma*',
      wildcard: '*',
    });

    expect(res.data).toEqual({ name: 'Madrid' });
  });

  it('parses JSON array params', async () => {
    const res = await request({ template: 'ids_query', ids: '[1,3]' });

    expect(res.data).toEqual([{ name: 'Geolytix' }, { name: 'Berlin' }]);
  });

  it('substitutes a param which fails to parse as JSON as string', async () => {
    const res = await request({ template: 'text_query', value: '[not json]' });

    expect(res.data).toEqual({ value: '[not json]' });
    expect(mockErrors.at(-1)).toBeInstanceOf(SyntaxError);
  });

  it('creates a ${filter} from the sqlFilter param', async () => {
    const res = await request({
      template: 'filter_query',
      sqlFilter: JSON.stringify({ category: { match: 'office' } }),
    });

    expect(res.data).toEqual({ name: 'Geolytix' });
  });
});

describe('Query: response', () => {
  it.each([
    [
      'multiple rows as array',
      'locations',
      200,
      [
        { id: 1, name: 'Geolytix' },
        { id: 2, name: 'Paris' },
        { id: 3, name: 'Berlin' },
        { id: 4, name: 'Madrid' },
      ],
    ],
    [
      'reduced rows as values arrays',
      'reduce_query',
      200,
      [
        ['Geolytix', 'office'],
        ['Paris', 'city'],
        ['Berlin', 'city'],
        ['Madrid', 'city'],
      ],
    ],
    ['a numeric value_only as string', 'count_value', 200, '4'],
    ['a string value_only', 'name_value', 200, 'Geolytix'],
    ['no rows', 'no_rows', 202, 'No rows returned from table.'],
    [
      'rows with only null values',
      'null_row',
      202,
      'No rows returned from table.',
    ],
    ['a database error', 'sql_error', 500, 'Failed to query PostGIS table.'],
  ])('sends %s', async (_, template, status, data) => {
    expect(await request({ template })).toEqual({ status, data });
  });
});

describe('Query: statement timeout', () => {
  it('sets the template statement_timeout', async () => {
    const res = await request({ template: 'template_timeout' });

    expect(res.data).toEqual({ timeout: '9s' });
  });

  it('ignores the statement_timeout request param', async () => {
    const res = await request({
      template: 'default_timeout',
      statement_timeout: '0',
    });

    // The STATEMENT_TIMEOUT from the xyzEnv applies.
    expect(res.data).toEqual({ timeout: '5s' });
  });
});

describe('Query: nonblocking queries', () => {
  it('returns 202 once the query is sent and executes the query', async () => {
    const res = await request({ template: 'nonblocking_query', msg: 'hello' });

    expect(res.status).toBe(202);
    expect(res.data).toMatch(/^Non blocking request sent at/);

    // PGlite executes queries in sequence. The log query reads the row once the nonblocking insert has completed.
    expect(
      (await request({ template: 'log_query', msg: 'hello' })).data,
    ).toEqual({ msg: 'hello' });
  });

  it('returns 503 when the dbs connection fails', async () => {
    expect(await request({ template: 'offline_nonblocking_query' })).toEqual({
      status: 503,
      data: 'Failed to connect to database.',
    });
  });
});
