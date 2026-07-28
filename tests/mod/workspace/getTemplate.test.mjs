import { describe, expect, it } from 'vitest';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';
import { mockConsole } from '../../scaffold.mjs';

//Errors from test so we can assert on them and not pollute the console.
mockConsole('error');

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
      '../../../mod/workspace/getTemplate.js'
    );

    const result = await getTemplate(template);

    expect(typeof result === 'object').toBeTruthy();
    expect(Object.hasOwn(result, 'roles')).toBeTruthy();
  });

  it('query module has render property', async () => {
    const template = 'mod_query';

    const { default: getTemplate } = await import(
      '../../../mod/workspace/getTemplate.js'
    );

    const result = await getTemplate(template);

    expect(typeof result === 'object').toBeTruthy();
    expect(Object.hasOwn(result, 'render')).toBeTruthy();
  });

  it('query module is Error', async () => {
    const template = 'bad_mod_query';

    const { default: getTemplate } = await import(
      '../../../mod/workspace/getTemplate.js'
    );

    const result = await getTemplate(template);

    expect(result instanceof Error).toBeTruthy();
  });

  it('query module render string', async () => {
    const template = 'mod_query_no_default';

    const { default: getTemplate } = await import(
      '../../../mod/workspace/getTemplate.js'
    );

    const result = await getTemplate(template);

    const foo = result.render.foo();

    expect(foo).toEqual('I am a module query fam');
  });
});
