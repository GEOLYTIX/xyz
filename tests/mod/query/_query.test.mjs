import { describe, expect, it, vi, beforeEach } from 'vitest';

// xyzEnv must be set before any mod/ imports since logger reads it at module load time.
globalThis.xyzEnv = {
  TITLE: 'QUERY TEST',
  WORKSPACE: 'file:./tests/assets/_workspace.json',
};

const { default: queries } = await import(
  '../../../mod/workspace/templates/_queries.js'
);

import query from '../../../mod/query.js';
import dbs_connections from '../../../mod/utils/dbs.js';
import workspaceCache from '../../../mod/workspace/cache.js';
import getTemplate from '../../../mod/workspace/getTemplate.js';
import * as Roles from '../../../mod/utils/roles.js';

// --- Mocks ---
vi.mock('../../../mod/utils/dbs.js', () => ({
  default: {
    layer_db: vi.fn().mockResolvedValue([{ status: 'ok' }]),
    workspace_db: vi.fn().mockResolvedValue([{ status: 'ok' }]),
    template_db: vi.fn().mockResolvedValue([{ status: 'ok' }]),
  },
}));

vi.mock('../../../mod/workspace/cache.js', () => ({
  default: vi.fn(),
}));

vi.mock('../../../mod/workspace/getTemplate.js', () => ({
  default: vi.fn(),
}));

vi.mock('../../../mod/utils/roles.js', () => ({
  check: vi.fn(),
}));

// Mock remaining side-effect dependencies to isolate the query module
vi.mock('../../../mod/utils/logger.js', () => ({ default: vi.fn() }));
vi.mock('../../../mod/user/login.js', () => ({ default: vi.fn() }));
vi.mock('../../../mod/workspace/getLayer.js', () => ({ default: vi.fn() }));
vi.mock('../../../mod/utils/sqlFilter.js', () => ({ default: vi.fn() }));

describe('query module', () => {
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

  describe('dbs connection precedence', () => {
    let req;
    let res;

    beforeEach(() => {
      vi.clearAllMocks();

      // Setup baseline request/response objects
      req = {
        params: {
          template: 'mock_template',
          user: { roles: ['admin'], admin: true },
        },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
        send: vi.fn(),
        finished: false,
      };

      // Ensure role checking passes by default
      Roles.check.mockReturnValue(true);

      // Default mock returns to safely reach line 115
      getTemplate.mockResolvedValue({
        template: 'SELECT * FROM mock_table', // Required to pass getQueryFromTemplate
        dbs: 'template_db',
      });

      workspaceCache.mockResolvedValue({
        dbs: undefined,
      });
    });

    it('should use template.dbs when layer and workspace dbs are NOT defined', async () => {
      await query(req, res);

      expect(dbs_connections.template_db).toHaveBeenCalled();
      expect(dbs_connections.workspace_db).not.toHaveBeenCalled();
      expect(dbs_connections.layer_db).not.toHaveBeenCalled();
    });

    it('should use workspace.dbs when defined, overriding template.dbs', async () => {
      workspaceCache.mockResolvedValue({
        dbs: 'workspace_db',
      });

      await query(req, res);

      expect(dbs_connections.workspace_db).toHaveBeenCalled();
      expect(dbs_connections.template_db).not.toHaveBeenCalled();
      expect(dbs_connections.layer_db).not.toHaveBeenCalled();
    });

    it('should use layer.dbs when defined, overriding workspace and template dbs', async () => {
      workspaceCache.mockResolvedValue({
        dbs: 'workspace_db',
      });

      // Inject the layer object directly into req.params to bypass the getLayer string-check
      req.params.layer = {
        qID: 'id',
        srid: 4326,
        geom: 'geom',
        dbs: 'layer_db',
      };

      getTemplate.mockResolvedValue({
        template: 'SELECT * FROM mock_table',
        dbs: 'template_db',
        layer: true, // Requires layer
      });

      await query(req, res);

      expect(dbs_connections.layer_db).toHaveBeenCalled();
      expect(dbs_connections.workspace_db).not.toHaveBeenCalled();
      expect(dbs_connections.template_db).not.toHaveBeenCalled();
    });
  });
});