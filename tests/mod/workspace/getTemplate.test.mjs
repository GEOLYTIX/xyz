import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// The file provider is mocked with an actual passthrough so single tests can assign a mock implementation.
const mockFileFn = vi.fn();

vi.mock('../../../mod/provider/file.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    default: (...args) =>
      mockFileFn.getMockImplementation()
        ? mockFileFn(...args)
        : actual.default(...args),
  };
});

const { default: checkWorkspaceCache } = await import(
  '../../../mod/workspace/cache.js'
);

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

  const { default: getTemplate } = await import(
    '../../../mod/workspace/getTemplate.js'
  );

  //Calling the cache method with force to reload a new workspace
  await checkWorkspaceCache('file');

  it('get template from workspace', async () => {
    const result = await getTemplate('OSM');

    expect(typeof result === 'object').toBeTruthy();
    expect(Object.hasOwn(result, 'roles')).toBeTruthy();
  });

  it('template with invalid characters', async () => {
    const result = await getTemplate('foo/bar');

    expect(result instanceof Error).toBeTruthy();
  });

  it('template with invalid src method', async () => {
    const result = await getTemplate({ src: 'foo:bar' });

    expect(result instanceof Error).toBeTruthy();
  });

  it('unable to get template from src', async () => {
    const result = await getTemplate({ src: 'file:foo/bar' });

    expect(result instanceof Error).toBeTruthy();
  });

  it('SQL string template from src', async () => {
    const result = await getTemplate({
      src: 'file:./tests/assets/queries/data_array.sql',
    });

    expect(typeof result === 'object').toBeTruthy();
  });

  it('query module has render property', async () => {
    const result = await getTemplate('mod_query');

    expect(typeof result === 'object').toBeTruthy();
    expect(Object.hasOwn(result, 'render')).toBeTruthy();
  });

  it('query module is Error', async () => {
    const result = await getTemplate('bad_mod_query');

    expect(result instanceof Error).toBeTruthy();
  });

  it('query module render string', async () => {
    const result = await getTemplate('mod_query_no_default');

    const foo = result.render.foo();

    expect(foo).toEqual('I am a module query fam');
  });

  it('templates sharing a src remain isolated', async () => {
    const fooTemplate = {
      foo: true,
      src: 'file:./tests/assets/layers/template_test/layer.json',
    };

    const fooResult = await getTemplate(fooTemplate);

    expect(fooResult.foo).toBeTruthy();
    expect(fooResult.bar).toBeFalsy();

    const barTemplate = {
      bar: true,
      src: 'file:./tests/assets/layers/template_test/layer.json',
    };

    const barResult = await getTemplate(barTemplate);

    expect(barResult.bar).toBeTruthy();
    expect(barResult.foo).toBeFalsy();
  });

  it('loads the template source into workspace.templates for repeat requests', async () => {
    const { default: getSrc } = await import('../../../mod/provider/getSrc.js');

    const workspace = await checkWorkspaceCache();

    workspace.templates.loaded_template = {
      src: 'file:./tests/assets/loaded-template.json',
    };

    mockFileFn.mockImplementation(async () => ({
      nested: { format: 'geojson' },
    }));

    try {
      const first = await getTemplate('loaded_template');

      expect(first.nested).toEqual({ format: 'geojson' });
      expect(first.srcLoaded).toBeUndefined();

      // The assembled template is loaded into the workspace.templates object.
      expect(workspace.templates.loaded_template.srcLoaded).toBe(true);
      expect(workspace.templates.loaded_template.nested).toEqual({
        format: 'geojson',
      });

      // The source map is flushed to prove repeat requests are resolved from the workspace.templates object.
      await getSrc({ clear: true });

      // Modification of a requested template must not affect the loaded template.
      first.nested.format = 'mutated';

      const second = await getTemplate('loaded_template');

      expect(second.nested).toEqual({ format: 'geojson' });
      expect(second.srcLoaded).toBeUndefined();
      expect(mockFileFn).toHaveBeenCalledTimes(1);
    } finally {
      mockFileFn.mockReset();
      delete workspace.templates.loaded_template;
    }
  });

  it('shares one source promise between concurrent templates', async () => {
    const src = 'file:./tests/assets/concurrent-template.json';

    mockFileFn.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return { format: 'geojson' };
    });

    try {
      const [foo, bar] = await Promise.all([
        getTemplate({ foo: true, src }),
        getTemplate({ bar: true, src }),
      ]);

      expect(foo).toMatchObject({ foo: true, format: 'geojson' });
      expect(bar).toMatchObject({ bar: true, format: 'geojson' });
      expect(mockFileFn).toHaveBeenCalledTimes(1);
    } finally {
      mockFileFn.mockReset();
    }
  });
});
