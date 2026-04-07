// xyzEnv must be set before any mod/ imports since logger reads it at module load time.
globalThis.xyzEnv = {
  TITLE: 'QUERY TEST',
  WORKSPACE: 'file:./tests/assets/_workspace.json',
};

const { default: queries } = await import(
  '../../../mod/workspace/templates/_queries.js'
);

await codi.describe({ name: 'query module', id: 'query_module' }, async () => {
  queriesRegistrationTests();
});

/**
 * Tests for the _queries.js template registration
 */
function queriesRegistrationTests() {
  codi.describe(
    {
      name: 'queries registration',
      id: 'queries_registration',
      parentId: 'query_module',
    },
    () => {
      codi.it(
        {
          name: 'table_schema should be registered in queries',
          parentId: 'queries_registration',
        },
        () => {
          codi.assertTrue(
            Object.hasOwn(queries, 'table_schema'),
            'table_schema should exist in queries',
          );
        },
      );

      codi.it(
        {
          name: 'table_schema should require admin access',
          parentId: 'queries_registration',
        },
        () => {
          codi.assertTrue(
            queries.table_schema.admin === true,
            'table_schema should have admin: true',
          );
        },
      );

      codi.it(
        {
          name: 'table_schema should require a layer',
          parentId: 'queries_registration',
        },
        () => {
          codi.assertTrue(
            queries.table_schema.layer === true,
            'table_schema should have layer: true',
          );
        },
      );

      codi.it(
        {
          name: 'table_schema should have a template string',
          parentId: 'queries_registration',
        },
        () => {
          codi.assertTrue(
            typeof queries.table_schema.template === 'string',
            'table_schema should have a string template',
          );
        },
      );
    },
  );
}
