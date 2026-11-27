import { createMocks } from 'node-mocks-http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
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
const { default: dbs } = await import('../../mod/utils/dbs.js');
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

  it('passes res.locals as params.locals without the request', async () => {
    const spy = vi.spyOn(dbs, 'DEVDB');

    const { req, res } = createMocks({ params: { template: 'simple_select' } });

    res.locals.foo = 'bar';

    await query(req, res);

    expect(res._getData()).toEqual({ greeting: 'hello' });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]).toHaveLength(1);
    expect(spy.mock.calls[0][0].locals).toBe(res.locals);
    expect(Object.values(spy.mock.calls[0][0])).not.toContain(req);

    spy.mockRestore();
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
      'a viewport with SQL in a bound',
      {
        layer: 'locations',
        viewport: '(select 1 from pg_sleep(10))::int,45,5,55,4326',
      },
      400,
    ],
    [
      'a viewport with SQL in the srid',
      { layer: 'locations', viewport: '-5,45,5,55,4326) --' },
      400,
    ],
    [
      'a viewport with too few bounds',
      { layer: 'locations', viewport: '-5,45,5' },
      400,
    ],
    [
      'a viewport with a geom param which is not whitelisted',
      {
        layer: 'locations',
        viewport: '-5,45,5,55,4326',
        geom: '(select geom from example.users limit 1)',
      },
      400,
    ],
    [
      'a field which is not in the layer',
      { layer: 'locations', fields: 'password' },
      400,
    ],
    [
      'a filter param which is a SQL string',
      { layer: 'locations', filter: JSON.stringify('TRUE OR TRUE') },
      400,
    ],
    [
      'a filter param which is an array with a SQL string',
      { layer: 'locations', filter: JSON.stringify(['TRUE OR TRUE']) },
      400,
    ],
    [
      'a filter param which is not valid JSON',
      { layer: 'locations', filter: 'TRUE OR TRUE' },
      400,
    ],
    [
      'a layer param which is parsed as boolean by the request params middleware',
      { layer: true },
      400,
    ],
    [
      'a layer param which is parsed as array by the request params middleware',
      { layer: ['locations'] },
      400,
    ],
    [
      'a layer_template param which is parsed as boolean by the request params middleware',
      { layer_template: true },
      400,
    ],
    [
      'a filter param which is parsed as boolean by the request params middleware',
      { layer: 'locations', filter: true },
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
    [
      'a sqlFilter which is a SQL string',
      { template: 'filter_query', sqlFilter: JSON.stringify('TRUE OR TRUE') },
    ],
    [
      'a sqlFilter which is an array with a SQL string',
      {
        template: 'filter_query',
        sqlFilter: JSON.stringify([{ category: { match: 'office' } }, 'TRUE']),
      },
    ],
    [
      'a sqlFilter which is not valid JSON',
      { template: 'filter_query', sqlFilter: 'TRUE OR TRUE' },
    ],
    [
      'a sqlFilter which is parsed as boolean by the request params middleware',
      { template: 'filter_query', sqlFilter: true },
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

describe('Query: layer_extent', () => {
  it('compares the ids param with the integer id column', async () => {
    // Hyde Park [2] and Unnamed [3] in London. The client sends the ids as strings.
    const res = await request(
      {
        template: 'layer_extent',
        layer: 'features',
        table: 'example.features',
        proj: 3857,
      },
      { ids: ['2', '3'] },
    );

    expect(res.status).toBe(200);
    expect(res.data).toEqual([-19000, 6711000, -15000, 6712000]);
  });
});

/**
 * The location write templates are authorized by the layer config composed for the requesting user.
 *
 * The scratch_readonly and scratch_edit layers of example.scratch_location have a default filter for the public category. The scratch_edit layer has a draw config, deleteLocation, editable entries, and a size entry which is editable for the editor role only.
 *
 * The tests insert their own rows, because all test files of a run share the devdb.
 */
describe('Query: location write authorization', () => {
  const table = 'example.scratch_location';

  const EDITOR = { email: 'editor@example.com', roles: ['editor'] };

  function write(template, layer, params = {}, body) {
    return request({ template, layer, table, ...params }, body);
  }

  /**
   * Inserts a public row through the scratch_edit layer and returns the id. The mapp createLocation method sends the layer.draw defaults in the body.
   */
  async function newRow(name) {
    const res = await write(
      'location_new',
      'scratch_edit',
      {},
      { name, category: 'public' },
    );

    expect(res.status).toBe(200);

    return res.data;
  }

  /**
   * Inserts a row with the private category, which does not pass the default filter.
   */
  async function privateRow(name) {
    return (await request({ template: 'scratch_insert_private', name })).data;
  }

  async function row(id) {
    return (await request({ template: 'scratch_row', id })).data;
  }

  describe('location_new', () => {
    it('inserts the editable fields and draw defaults', async () => {
      const id = await newRow('new public');

      expect(await row(id)).toMatchObject({
        name: 'new public',
        category: 'public',
      });
    });

    it('returns 403 on a layer without a draw config', async () => {
      const res = await write(
        'location_new',
        'scratch_readonly',
        {},
        { name: 'denied', category: 'public' },
      );

      expect(res.status).toBe(403);
    });

    it.each([
      ['the layer qID', { name: 'x', id: 99 }],
      [
        'a draw defaults field with another value',
        { name: 'x', category: 'private' },
      ],
      ['a field which is editable for another role', { name: 'x', size: 1 }],
    ])('returns 403 for %s', async (_, body) => {
      const res = await write('location_new', 'scratch_edit', {}, body);

      expect(res.status).toBe(403);
    });

    it('inserts a field which is editable for the user role', async () => {
      const res = await write(
        'location_new',
        'scratch_edit',
        { user: EDITOR },
        { name: 'editor new', category: 'public', size: 3 },
      );

      expect(res.status).toBe(200);
      expect(await row(res.data)).toMatchObject({ size: 3 });
    });
  });

  describe('location_update', () => {
    it('updates the editable fields', async () => {
      const id = await newRow('update me');

      const res = await write(
        'location_update',
        'scratch_edit',
        { id },
        {
          name: 'updated',
          tag: { jsonb: { props: { tag: 'blue' } } },
          meta: { colour: 'red' },
        },
      );

      expect(res.status).toBe(202);
      expect(await row(id)).toMatchObject({
        name: 'updated',
        props: { tag: 'blue' },
        meta: { colour: 'red' },
      });
    });

    it('returns 403 on a layer without editable entries', async () => {
      const id = await newRow('read only');

      const res = await write(
        'location_update',
        'scratch_readonly',
        { id },
        { name: 'tampered' },
      );

      expect(res.status).toBe(403);
      expect((await row(id)).name).toBe('read only');
    });

    it.each([
      ['a field which is not editable', { category: 'tampered' }],
      ['a column which is not in the infoj', { props: { injected: true } }],
      ['a field which is editable for another role', { size: 999 }],
      [
        'a jsonb value for another jsonb field',
        { tag: { jsonb: { meta: { injected: true } } } },
      ],
      [
        'a jsonb key which is not the jsonb_key of the entry',
        { tag: { jsonb: { props: { injected: true } } } },
      ],
      ['a plain value for the field of a jsonb entry', { tag: 'plain' }],
      [
        'a jsonb value for a field which is not a jsonb entry',
        { name: { jsonb: { props: { tag: 'x' } } } },
      ],
      ['the layer qID', { id: 1 }],
    ])('returns 403 for %s', async (_, body) => {
      const id = await newRow('update denied');

      const res = await write('location_update', 'scratch_edit', { id }, body);

      expect(res.status).toBe(403);
      expect(await row(id)).toMatchObject({
        name: 'update denied',
        category: 'public',
        size: null,
        props: null,
      });
    });

    /**
     * The meta json field of the scratch_edit layer is only editable through the colour json_key entry. The mapp location update sends the whole meta object with the current values of the other keys.
     */
    describe('a json field edited through json_key entries', () => {
      async function metaRow(name) {
        const id = await newRow(name);

        await request({
          template: 'scratch_set_meta',
          id,
          meta: JSON.stringify({ colour: 'red', owner: 'alice' }),
        });

        return id;
      }

      it('merges the editable key and keeps the other keys', async () => {
        const id = await metaRow('json merge');

        const res = await write(
          'location_update',
          'scratch_edit',
          { id },
          { meta: { colour: 'blue', owner: 'alice' } },
        );

        expect(res.status).toBe(202);
        expect((await row(id)).meta).toEqual({
          colour: 'blue',
          owner: 'alice',
        });
      });

      it('does not write a key which is not editable', async () => {
        const id = await metaRow('json owner');

        const res = await write(
          'location_update',
          'scratch_edit',
          { id },
          { meta: { colour: 'green', owner: 'attacker' } },
        );

        expect(res.status).toBe(202);
        expect((await row(id)).meta).toEqual({
          colour: 'green',
          owner: 'alice',
        });
      });

      it('returns 403 for a value which would replace the json field', async () => {
        const id = await metaRow('json null');

        const res = await write(
          'location_update',
          'scratch_edit',
          { id },
          { meta: null },
        );

        expect(res.status).toBe(403);
        expect((await row(id)).meta).toEqual({ colour: 'red', owner: 'alice' });
      });
    });

    /**
     * The scratch_jsonb_alias layer has an editable jsonb entry whose field is the geom column. The geom column itself is not editable. The template writes a value with coordinates as a geometry, even if the value has a jsonb property.
     */
    describe('a jsonb entry whose field is a table column', () => {
      it('merges a jsonb value into the jsonb field', async () => {
        const id = await newRow('jsonb alias');

        const res = await write(
          'location_update',
          'scratch_jsonb_alias',
          { id },
          { geom: { jsonb: { props: { label: 'a' } } } },
        );

        expect(res.status).toBe(202);
        expect(await row(id)).toMatchObject({
          props: { label: 'a' },
          geom: null,
        });
      });

      it('returns 403 for a jsonb value with coordinates', async () => {
        const id = await newRow('jsonb geometry');

        const res = await write(
          'location_update',
          'scratch_jsonb_alias',
          { id },
          {
            geom: {
              type: 'Point',
              coordinates: [1, 1],
              jsonb: { props: { label: 'a' } },
            },
          },
        );

        expect(res.status).toBe(403);
        expect(await row(id)).toMatchObject({ props: null, geom: null });
      });
    });

    it('updates a field which is editable for the user role', async () => {
      const id = await newRow('editor update');

      await write(
        'location_update',
        'scratch_edit',
        { id, user: EDITOR },
        { size: 7 },
      );

      expect((await row(id)).size).toBe(7);
    });

    it('returns 403 for a table which is not a layer table', async () => {
      // The example.log table is referenced in a dataview entry of the layer.
      const res = await request(
        {
          template: 'location_update',
          layer: 'scratch_edit',
          table: 'example.log',
          id: '1',
        },
        { name: 'tampered' },
      );

      expect(res.status).toBe(403);
    });

    it('does not update a row which fails the default filter', async () => {
      const id = await privateRow('hidden update');

      await write(
        'location_update',
        'scratch_edit',
        { id },
        { name: 'tampered' },
      );

      expect((await row(id)).name).toBe('hidden update');
    });
  });

  describe('location_get', () => {
    it('does not return a row which fails the default filter', async () => {
      const id = await privateRow('hidden get');

      const res = await write('location_get', 'scratch_readonly', { id });

      expect(res.status).toBe(202);
    });

    it('returns a row which passes the default filter', async () => {
      const id = await newRow('public get');

      const res = await write('location_get', 'scratch_readonly', { id });

      expect(res.data).toEqual({
        id: Number(id),
        name: 'public get',
        category: 'public',
        size: null,
      });
    });
  });

  describe('location_delete', () => {
    it('deletes a row on a layer with deleteLocation', async () => {
      const id = await newRow('delete me');

      await write('location_delete', 'scratch_edit', { id });

      expect((await request({ template: 'scratch_row', id })).status).toBe(202);
    });

    it('returns 403 on a layer without deleteLocation', async () => {
      const id = await newRow('keep me');

      const res = await write('location_delete', 'scratch_readonly', { id });

      expect(res.status).toBe(403);
      expect((await row(id)).name).toBe('keep me');
    });

    it('does not delete a row which fails the default filter', async () => {
      const id = await privateRow('hidden delete');

      await write('location_delete', 'scratch_edit', { id });

      expect((await row(id)).name).toBe('hidden delete');
    });
  });

  describe('locations_delete', () => {
    it('returns 403 on a layer without deleteLocation', async () => {
      const id = await newRow('bulk keep');

      const res = await write('locations_delete', 'scratch_readonly');

      expect(res.status).toBe(403);
      expect((await row(id)).name).toBe('bulk keep');
    });

    it('deletes the rows which pass the filter on a layer with deleteLocation', async () => {
      const id = await newRow('bulk delete');
      const keep = await newRow('bulk delete keep');

      // The filter restricts the delete to the row of this test. The test rows of other tests share the table.
      await write('locations_delete', 'scratch_edit', {
        filter: JSON.stringify({ name: { match: 'bulk delete' } }),
      });

      expect((await request({ template: 'scratch_row', id })).status).toBe(202);
      expect((await row(keep)).name).toBe('bulk delete keep');
    });
  });

  describe('sql_table_insert', () => {
    function insert(layer, body, params = {}) {
      return write('sql_table_insert', layer, params, body);
    }

    it('inserts the fields of the csv_upload config', async () => {
      const res = await insert('scratch_edit', {
        'name::text': ['csv insert'],
        'category::text': ['public'],
      });

      expect(res.status).toBe(202);

      const inserted = await request({
        template: 'scratch_by_name',
        name: 'csv insert',
      });

      expect(inserted.data).toEqual({ name: 'csv insert', category: 'public' });
    });

    it.each([
      ['a layer without an insert config', 'scratch_readonly', {}],
      ['a field which is not in the config fields', 'scratch_edit', {}],
      [
        'a table which is not the config table',
        'scratch_edit',
        { table: 'example.log' },
      ],
    ])('returns 403 for %s', async (title, layer, params) => {
      const body = title.startsWith('a field')
        ? { 'size::int': [1] }
        : { 'name::text': ['csv denied'] };

      const res = await insert(layer, body, params);

      expect(res.status).toBe(403);
    });
  });

  describe('LOCATION_WRITES=legacy', () => {
    const warnings = [];

    beforeAll(() => {
      xyzEnv.LOCATION_WRITES = 'legacy';
      vi.spyOn(console, 'warn').mockImplementation((msg) => warnings.push(msg));
    });

    afterAll(() => {
      delete xyzEnv.LOCATION_WRITES;
      vi.mocked(console.warn).mockRestore();
    });

    it('executes an unauthorized write and logs a warning', async () => {
      const id = await newRow('legacy');

      const res = await write(
        'location_update',
        'scratch_readonly',
        { id },
        { category: 'legacy' },
      );

      expect(res.status).toBe(202);
      expect((await row(id)).category).toBe('legacy');
      expect(warnings.at(-1)).toMatch(/^LOCATION_WRITES=legacy permitted/);
    });

    it('applies the default filter', async () => {
      const id = await privateRow('legacy hidden');

      await write(
        'location_update',
        'scratch_readonly',
        { id },
        { name: 'tampered' },
      );

      expect((await row(id)).name).toBe('legacy hidden');
    });
  });
});
