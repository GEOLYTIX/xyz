import { describe, expect, it } from 'vitest';

// xyzEnv must be set before any mod/ imports since logger reads it at module load time.
globalThis.xyzEnv = {
  TITLE: 'QUERY TEST',
  WORKSPACE: 'file:./tests/assets/_workspace.json',
};

const { default: queries } = await import(
  '../../../mod/workspace/templates/_queries.js'
);

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
});
