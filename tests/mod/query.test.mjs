import { describe, expect, it } from 'vitest';

/**
 * ## Query Tests
 * @module mod/query
 */

/**
 * Tests for the query API endpoint.
 * These tests require a running server and the browser-side `mapp` global.
 */
// This test requires a running server and the browser-side `mapp` global.
// It is skipped in server-side vitest runs.
describe.skip('Query: Testing Query API', () => {
  /**
   * @description Testing Query defined on infoj entry
   */
  it('Testing Query defined on infoj entry', async () => {
    const expected_result = [1, 2, 5, 3, 4];
    const results = await mapp.utils.xhr(`/test/api/query?template=data_array`);
    expect(results).toEqual(expected_result);
  });

  /**
   * @description Testing Module defined in templates
   */
  it('Testing Module defined in templates', async () => {
    const expected_result = {
      bar: 'foo',
    };
    const results = await mapp.utils.xhr(
      `/test/api/query?template=module_test`,
    );
    expect(results).toEqual(expected_result);
  });

  /**
   * @description Testing a query with a bogus dbs string via the req params
   */
  it('Testing a query with a bogus dbs string via the req params', async () => {
    const expected_result = {
      bar: 'foo',
    };
    const results = await mapp.utils.xhr(
      `/test/api/query?template=module_test&dbs=bogus`,
    );
    expect(results).toEqual(expected_result);
  });

  /**
   * @description Testing a query with a bogus dbs on the template
   */
  it('Testing a query with a bogus dbs on the template', async () => {
    const results = await mapp.utils.xhr(
      `/test/api/query?template=bogus_data_array`,
    );
    expect(results instanceof Error).toBeTruthy();
  });

  /**
   * @description Testing a query with a bogus dbs on the template (cluster)
   */
  it('Testing a query with a bogus dbs on the template (cluster)', async () => {
    const results = await mapp.utils.xhr(`/test/api/query?template=cluster`);
    expect(results instanceof Error).toBeTruthy();
  });
});
