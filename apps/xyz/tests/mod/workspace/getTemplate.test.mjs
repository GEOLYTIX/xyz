import checkWorkspaceCache from '@geolytix/xyz-app/mod/workspace/cache.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

//Assigning console.error to a property to restore original function with.
const originalConsole = console.error;

//erros from test so we can assert on them and not get polute the console.
const mockErrors = [];

beforeAll(() => {
  //Changing the console.error function to push to our local collection of messages.
  console.error = (message) => {
    mockErrors.push(message);
  };
});

afterAll(() => {
  console.error = originalConsole;
});

describe('getTemplate', async () => {
  globalThis.xyzEnv = {
    TITLE: 'TITLE',
    WORKSPACE: 'file:./tests/assets/workspace_locale_layers_templates.json',
  };

  //Calling the cache method with force to reload a new workspace
  await checkWorkspaceCache('file');

  it('get template from workspace', async () => {
    const template = 'OSM';

    const { default: getTemplate } = await import(
      '@geolytix/xyz-app/mod/workspace/getTemplate.js'
    );

    const result = await getTemplate(template);

    expect(typeof result === 'object').toBeTruthy();
    expect(Object.hasOwn(result, 'roles')).toBeTruthy();
  });

  it('query module has render property', async () => {
    const template = 'mod_query';

    const { default: getTemplate } = await import(
      '@geolytix/xyz-app/mod/workspace/getTemplate.js'
    );

    const result = await getTemplate(template);

    expect(typeof result === 'object').toBeTruthy();
    expect(Object.hasOwn(result, 'render')).toBeTruthy();
  });

  it('query module is Error', async () => {
    const template = 'bad_mod_query';

    const { default: getTemplate } = await import(
      '@geolytix/xyz-app/mod/workspace/getTemplate.js'
    );

    const result = await getTemplate(template);

    expect(result instanceof Error).toBeTruthy();
  });

  it('query module render string', async () => {
    const template = 'mod_query_no_default';

    const { default: getTemplate } = await import(
      '@geolytix/xyz-app/mod/workspace/getTemplate.js'
    );

    const result = await getTemplate(template);

    const foo = result.render.foo();

    expect(foo).toEqual('I am a module query fam');
  });
});
