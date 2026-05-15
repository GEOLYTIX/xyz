import { createMocks } from 'node-mocks-http';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

/**
 * ## Query Tests
 * @module mod/query
 */

// Define dedicated mocks for testing DB precedence overrides
const mockDbQuery = vi.fn();
const mockLayerDb = vi.fn().mockResolvedValue([{ status: 'ok' }]);
const mockWorkspaceDb = vi.fn().mockResolvedValue([{ status: 'ok' }]);
const mockReqDb = vi.fn().mockResolvedValue([{ status: 'ok' }]);
const mockTemplateDb = vi.fn().mockResolvedValue([{ status: 'ok' }]);

// Mock dbs_connections so no real database is required.
// Uses a Proxy to support both wildcard fallback (mockDbQuery) and specific DBs.
vi.mock('../../mod/utils/dbs.js', () => {
  const dbMocks = {
    layer_db: mockLayerDb,
    workspace_db: mockWorkspaceDb,
    req_db: mockReqDb,
    template_db: mockTemplateDb,
  };

  return {
    default: new Proxy(dbMocks, {
      get(target, prop) {
        if (prop === '__esModule') return true;
        if (target[prop]) return target[prop]; // Return mapped DBs for precedence tests
        return mockDbQuery; // Fallback for standard tests
      },
      has(target, prop) {
        if (prop === 'NEON' || prop in target) return true;
        return false;
      },
      getOwnPropertyDescriptor(target, prop) {
        if (prop === 'NEON')
          return { configurable: true, enumerable: true, value: mockDbQuery };
        if (target[prop])
          return { configurable: true, enumerable: true, value: target[prop] };
        return undefined;
      },
    }),
  };
});

// Mock the login module to prevent view rendering side effects.
vi.mock('../../mod/user/login.js', () => ({
  default: (req, res) => {
    res.status(401).send(req.params.msg);
  },
}));

// Mock the logger to suppress output during tests.
vi.mock('../../mod/utils/logger.js', () => ({
  default: () => {},
}));

// Dynamically mock the dependencies so we can override them for precedence tests
// without breaking the original tests that rely on the actual underlying modules.
vi.mock('../../mod/workspace/getTemplate.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, default: vi.fn().mockImplementation(actual.default) };
});

vi.mock('../../mod/workspace/cache.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, default: vi.fn().mockImplementation(actual.default) };
});

vi.mock('../../mod/utils/roles.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, check: vi.fn().mockImplementation(actual.check) };
});

const { default: queries } = await import(
  '../../mod/workspace/templates/_queries.js'
);
const { default: query } = await import('../../mod/query.js');
const { default: checkWorkspaceCache } = await import(
  '../../mod/workspace/cache.js'
);
const { default: getTemplate } = await import(
  '../../mod/workspace/getTemplate.js'
);
const Roles = await import('../../mod/utils/roles.js');

// Suppress console.error from getTemplate for missing template tests.
const originalConsoleError = console.error;

describe('Query: Testing Query API', () => {
  beforeAll(async () => {
    console.error = () => {};

    globalThis.xyzEnv = {
      TITLE: 'QUERY TEST',
      WORKSPACE: 'file:./tests/assets/query_workspace.json',
    };

    await checkWorkspaceCache(true);
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    mockDbQuery.mockClear();
    mockLayerDb.mockClear();
    mockWorkspaceDb.mockClear();
    mockReqDb.mockClear();
    mockTemplateDb.mockClear();
  });

  describe('queries registration', () => {
    it('table_schema should be registered in queries', () => {
      expect(Object.hasOwn(queries, 'table_schema')).toBe(true);
    });

    it('table_schema should require admin access', () => {
      expect(queries.table_schema.admin).toBe(true);
    });

    it('table_schema should require a layer', () => {
      expect(queries.table_schema.layer).toBe(true);
    });

    it('table_schema should have a template string', () => {
      expect(typeof queries.table_schema.template).toBe('string');
    });
  });

  describe('dbs connection', () => {
    beforeEach(() => {
      Roles.check.mockReturnValue(true);
    });

    it('should return 400 when the resolved dbs connection does not exist', async () => {
      const { req, res } = createMocks({
        params: {
          template: 'mock_template',
          user: { roles: ['admin'], admin: true },
        },
      });

      // Resolve the workspace without a DB, and force the template to use an invalid DB
      checkWorkspaceCache.mockResolvedValueOnce({ dbs: undefined });
      getTemplate.mockResolvedValueOnce({
        template: 'SELECT * FROM mock_table',
        dbs: 'invalid_bogus_db', // This does not exist in our dbs_connections mock
      });

      await query(req, res);

      // Assert the expected error response
      expect(res.statusCode).toBe(400);
      expect(res._getData()).toBe(
        'Failed to validate database connection method.',
      );

      // Ensure no database connections were actually triggered
      expect(mockTemplateDb).not.toHaveBeenCalled();
      expect(mockWorkspaceDb).not.toHaveBeenCalled();
      expect(mockReqDb).not.toHaveBeenCalled();
      expect(mockLayerDb).not.toHaveBeenCalled();
      expect(mockDbQuery).not.toHaveBeenCalled();
    });

    it('should use template.dbs when layer, workspace, and req dbs are NOT defined', async () => {
      const { req, res } = createMocks({
        params: {
          template: 'mock_template',
          user: { roles: ['admin'], admin: true },
        },
      });

      checkWorkspaceCache.mockResolvedValueOnce({ dbs: undefined });
      getTemplate.mockResolvedValueOnce({
        template: 'SELECT * FROM mock_table',
        dbs: 'template_db',
      });

      await query(req, res);

      expect(mockTemplateDb).toHaveBeenCalled();
      expect(mockWorkspaceDb).not.toHaveBeenCalled();
      expect(mockReqDb).not.toHaveBeenCalled();
      expect(mockLayerDb).not.toHaveBeenCalled();
    });

    it('should use workspace.dbs when defined, overriding req.params and template dbs', async () => {
      const { req, res } = createMocks({
        params: {
          template: 'mock_template',
          dbs: 'req_db',
          user: { roles: ['admin'], admin: true },
        },
      });

      checkWorkspaceCache.mockResolvedValueOnce({ dbs: 'workspace_db' });
      getTemplate.mockResolvedValueOnce({
        template: 'SELECT * FROM mock_table',
        dbs: 'template_db',
      });

      await query(req, res);

      expect(mockWorkspaceDb).toHaveBeenCalled();
      expect(mockReqDb).not.toHaveBeenCalled();
      expect(mockTemplateDb).not.toHaveBeenCalled();
      expect(mockLayerDb).not.toHaveBeenCalled();
    });

    it('should use layer.dbs when defined, overriding workspace, req, and template dbs', async () => {
      const { req, res } = createMocks({
        params: {
          template: 'mock_template',
          dbs: 'req_db',
          user: { roles: ['admin'], admin: true },
          // Inject layer directly into req.params to bypass getLayer lookup
          layer: {
            qID: 'id',
            srid: 4326,
            geom: 'geom',
            dbs: 'layer_db',
          },
        },
      });

      checkWorkspaceCache.mockResolvedValueOnce({ dbs: 'workspace_db' });
      getTemplate.mockResolvedValueOnce({
        template: 'SELECT * FROM mock_table',
        dbs: 'template_db',
        layer: true, // Requires layer
      });

      await query(req, res);

      expect(mockLayerDb).toHaveBeenCalled();
      expect(mockWorkspaceDb).not.toHaveBeenCalled();
      expect(mockReqDb).not.toHaveBeenCalled();
      expect(mockTemplateDb).not.toHaveBeenCalled();
    });
  });

  describe('Template resolution', () => {
    it('should return 400 for a non-existent template', async () => {
      const { req, res } = createMocks({
        params: {
          template: 'non_existent_template',
        },
      });

      await query(req, res);

      // A missing template cannot be parsed, resulting in a 400 from executeQuery.
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when a layer template is used without a layer param', async () => {
      const { req, res } = createMocks({
        params: {
          template: 'location_get',
        },
      });

      await query(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getData()).toContain(
        'location_get query requires a valid layer request parameter',
      );
    });
  });

  describe('Query execution', () => {
    it('should execute a simple query and return a single row', async () => {
      mockDbQuery.mockResolvedValueOnce([{ greeting: 'hello' }]);

      const { req, res } = createMocks({
        params: {
          template: 'simple_select',
        },
      });

      await query(req, res);

      expect(mockDbQuery).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual({ greeting: 'hello' });
    });

    it('should return 202 when query returns no rows', async () => {
      mockDbQuery.mockResolvedValueOnce([]);

      const { req, res } = createMocks({
        params: {
          template: 'simple_select',
        },
      });

      await query(req, res);

      expect(res.statusCode).toBe(202);
      expect(res._getData()).toBe('No rows returned from table.');
    });

    it('should return 500 when database returns an error', async () => {
      mockDbQuery.mockResolvedValueOnce(new Error('connection refused'));

      const { req, res } = createMocks({
        params: {
          template: 'simple_select',
        },
      });

      await query(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getData()).toBe('Failed to query PostGIS table.');
    });

    it('should return multiple rows as an array', async () => {
      const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
      mockDbQuery.mockResolvedValueOnce(rows);

      const { req, res } = createMocks({
        params: {
          template: 'simple_select',
        },
      });

      await query(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(rows);
    });
  });

  describe('Response formatting', () => {
    it('should reduce rows to value arrays when template has reduce flag', async () => {
      mockDbQuery.mockResolvedValueOnce([
        { name: 'alice', value: 10 },
        { name: 'bob', value: 20 },
      ]);

      const { req, res } = createMocks({
        params: {
          template: 'reduce_query',
          table: 'users',
        },
      });

      await query(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual([
        ['alice', 10],
        ['bob', 20],
      ]);
    });

    it('should return only the first value when template has value_only flag', async () => {
      mockDbQuery.mockResolvedValueOnce([{ cnt: 42 }]);

      const { req, res } = createMocks({
        params: {
          template: 'value_only_query',
          table: 'users',
        },
      });

      await query(req, res);

      expect(res.statusCode).toBe(200);
      // Numeric values are converted to strings by sendRows.
      expect(res._getData()).toBe('42');
    });
  });

  describe('Parameter substitution', () => {
    it('should substitute ${} identifier params and %{} value params', async () => {
      mockDbQuery.mockResolvedValueOnce([{ age: 30 }]);

      const { req, res } = createMocks({
        params: {
          template: 'param_query',
          field: 'age',
          table: 'users',
          name: 'alice',
        },
      });

      await query(req, res);

      expect(mockDbQuery).toHaveBeenCalled();
      const [queryStr, sqlParams] = mockDbQuery.mock.calls[0];

      // ${field} and ${table} are replaced inline.
      expect(queryStr).toContain('SELECT age FROM users');
      // %{name} is replaced with $1, and 'alice' is in the SQL params.
      expect(queryStr).toContain('$1');
      expect(sqlParams).toContain('alice');
    });

    it('should reject identifier params with invalid characters', async () => {
      const { req, res } = createMocks({
        params: {
          template: 'injection_query',
          field: 'age; DROP TABLE users;--',
          table: 'users',
        },
      });

      await query(req, res);

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when required params are missing', async () => {
      const { req, res } = createMocks({
        params: {
          template: 'param_query',
          // field, table, and name are all missing.
        },
      });

      await query(req, res);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Nonblocking queries', () => {
    it('should return immediately for nonblocking queries', async () => {
      mockDbQuery.mockResolvedValueOnce([]);

      const { req, res } = createMocks({
        params: {
          template: 'nonblocking_query',
          msg: 'test message',
        },
      });

      await query(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toBe('Non blocking request sent.');
      expect(mockDbQuery).toHaveBeenCalled();
    });
  });

  describe('Core query templates', () => {
    it('should execute distinct_values template with correct SQL', async () => {
      mockDbQuery.mockResolvedValueOnce([{ name: 'alice' }, { name: 'bob' }]);

      const { req, res } = createMocks({
        params: {
          template: 'distinct_values',
          field: 'name',
          table: 'users',
        },
      });

      await query(req, res);

      expect(mockDbQuery).toHaveBeenCalled();
      const [queryStr] = mockDbQuery.mock.calls[0];
      expect(queryStr).toContain('SELECT distinct(name)');
      expect(queryStr).toContain('FROM users');
      expect(queryStr).toContain('ORDER BY name');
    });

    it('should execute field_max template with correct SQL', async () => {
      mockDbQuery.mockResolvedValueOnce([{ max: 100 }]);

      const { req, res } = createMocks({
        params: {
          template: 'field_max',
          field: 'price',
          table: 'products',
        },
      });

      await query(req, res);

      expect(mockDbQuery).toHaveBeenCalled();
      const [queryStr] = mockDbQuery.mock.calls[0];
      expect(queryStr).toContain('max(price)');
      expect(queryStr).toContain('FROM products');
    });
  });
});
