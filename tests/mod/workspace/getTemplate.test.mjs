import checkWorkspaceCache from '../../../mod/workspace/cache.js';

//Assigning console.error to a property to restore original function with.
const originalConsole = console.error;

//erros from test so we can assert on them and not get polute the console.
const mockErrors = [];

//Changing the console.error function to push to our local collection of messages.
console.error = (message) => {
  mockErrors.push(message);
};

await codi.describe(
  { name: 'getTemplate', id: 'workspace_getTemplate', parentId: 'workspace' },
  async () => {
    globalThis.xyzEnv = {
      TITLE: 'TITLE',
      WORKSPACE: 'file:./tests/assets/workspace_locale_layers_templates.json',
    };

    //Calling the cache method with force to reload a new workspace
    await checkWorkspaceCache('file');

    await codi.it(
      {
        name: 'get template from workspace',
        parentId: 'workspace_getTemplate',
      },
      async () => {
        const template = 'OSM';

        const { default: getTemplate } = await import(
          '../../../mod/workspace/getTemplate.js'
        );

        const result = await getTemplate(template);

        codi.assertTrue(typeof result === 'object');
        codi.assertTrue(Object.hasOwn(result, 'roles'));
      },
    );

    await codi.it(
      {
        name: 'query module has render property',
        parentId: 'workspace_getTemplate',
      },
      async () => {
        const template = 'mod_query';

        const { default: getTemplate } = await import(
          '../../../mod/workspace/getTemplate.js'
        );

        const result = await getTemplate(template);

        codi.assertTrue(typeof result === 'object');
        codi.assertTrue(Object.hasOwn(result, 'render'));
      },
    );

    await codi.it(
      {
        name: 'query module is Error',
        parentId: 'workspace_getTemplate',
      },
      async () => {
        const template = 'bad_mod_query';

        const { default: getTemplate } = await import(
          '../../../mod/workspace/getTemplate.js'
        );

        const result = await getTemplate(template);

        codi.assertTrue(result instanceof Error);
      },
    );

    await codi.it(
      {
        name: 'query module render string',
        parentId: 'workspace_getTemplate',
      },
      async () => {
        const template = 'mod_query_no_default';

        const { default: getTemplate } = await import(
          '../../../mod/workspace/getTemplate.js'
        );

        const result = await getTemplate(template);

        const foo = result.render.foo();

        codi.assertEqual(foo, 'I am a module query fam');
      },
    );
  },
);

console.error = originalConsole;
