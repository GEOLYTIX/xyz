/**
 * ## queryTest()
 * @module mod/query
 */

/**
 * This function is used to test the query API endpoint
 * @function querytest
 * @param {Object} mapview
 */
export function queryTest() {
  codi.describe({ name: 'Query: Testing Query API', id: 'api_query' }, () => {
    /**
     * @description Testing Query defined on infoj entry
     * @function it
     */
    codi.it(
      { name: 'Testing Query defined on infoj entry', parentId: 'api_query' },
      async () => {
        const expected_result = [1, 2, 5, 3, 4];
        const results = await mapp.utils.xhr(
          `/test/api/query?template=data_array`,
        );
        codi.assertEqual(
          results,
          expected_result,
          'We should be able to just call the template even if its not part of the workspace.templates object in configuration',
        );
      },
    );
    /**
     * @description Testing Module defined in templates
     * @function it
     */
    codi.it(
      { name: 'Testing Module defined in templates', parentId: 'api_query' },
      async () => {
        const expected_result = {
          bar: 'foo',
        };
        const results = await mapp.utils.xhr(
          `/test/api/query?template=module_test`,
        );
        codi.assertEqual(
          results,
          expected_result,
          'The Module should return the basic query',
        );
      },
    );

    /**
     * @description Testing a query with a bogus dbs string via the req params
     * @function it
     */
    codi.it(
      {
        name: 'Testing a query with a bogus dbs string via the req params',
        parentId: 'api_query',
      },
      async () => {
        const expected_result = {
          bar: 'foo',
        };
        const results = await mapp.utils.xhr(
          `/test/api/query?template=module_test&dbs=bogus`,
        );
        codi.assertEqual(
          results,
          expected_result,
          'The Module should return the basic query',
        );
      },
    );

    /**
     * @description Testing a query with a bogus dbs on the template
     * @function it
     */
    codi.it(
      {
        name: 'Testing a query with a bogus dbs on the template',
        parentId: 'api_query',
      },
      async () => {
        const results = await mapp.utils.xhr(
          `/test/api/query?template=bogus_data_array`,
        );
        codi.assertTrue(
          results instanceof Error,
          'We should return an error for a bogus DBS connection',
        );
      },
    );

    /**
     * @description Testing a query with a bogus dbs on the template
     * @function it
     */
    codi.it(
      {
        name: 'Testing a query with a bogus dbs on the template',
        parentId: 'api_query',
      },
      async () => {
        const results = await mapp.utils.xhr(
          `/test/api/query?template=cluster`,
        );
        codi.assertTrue(
          results instanceof Error,
          'We should get an error because we didnt provide a layer param',
        );
      },
    );
  });
}
