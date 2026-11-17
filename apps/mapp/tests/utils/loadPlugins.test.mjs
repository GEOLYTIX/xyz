import { describe, expect, it, vi } from 'vitest';
import loadPlugins from '../../lib/utils/loadPlugins.mjs';

// The Vitest server serves the fixtures from the root of the mapp app.
const origin = new URL(document.URL).origin;

const PLUGIN = '/tests/utils/fixtures/plugin.mjs';
const PLUGIN_ERROR = '/tests/utils/fixtures/pluginError.mjs';

describe('utils/loadPlugins', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.loadPlugins).toBe(loadPlugins);
  });

  it.each([[undefined], [PLUGIN], [{ plugin: PLUGIN }]])(
    'returns undefined if the plugins are not an array %o',
    (plugins) => {
      expect(loadPlugins(plugins)).toBeUndefined();
    },
  );

  it('imports a plugin module from the document origin', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(globalThis.testPluginLoaded).toBeUndefined();

    expect(await loadPlugins([PLUGIN])).toBeUndefined();

    // The plugin module has been evaluated.
    expect(globalThis.testPluginLoaded).toBe(1);
    expect(warn).not.toHaveBeenCalled();
  });

  it('resolves with an empty plugins array', async () => {
    expect(await loadPlugins([])).toBeUndefined();
  });

  it('resolves if a plugin fails to load', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    // The first module throws and the second module does not exist.
    expect(
      await loadPlugins([PLUGIN_ERROR, '/tests/utils/fixtures/missing.mjs']),
    ).toBeUndefined();

    expect(warn.mock.calls.map(([message]) => message).sort()).toEqual([
      `Failed to load plugin: ${origin}/tests/utils/fixtures/missing.mjs`,
      `Failed to load plugin: ${origin}${PLUGIN_ERROR}`,
    ]);

    expect(error).toHaveBeenCalledTimes(2);

    expect(
      error.mock.calls.some(
        ([err]) => err instanceof Error && err.message === 'The plugin failed.',
      ),
    ).toBe(true);
  });

  it('only imports sources which end with .js or .mjs', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.spyOn(console, 'error').mockImplementation(() => {});

    // The sources do not exist. An import of a source fails with a warning.
    await loadPlugins([
      '/tests/utils/fixtures/missing.json',
      '/tests/utils/fixtures/missing.css',
      '/tests/utils/fixtures/missing.js',
      '/tests/utils/fixtures/missing_module.mjs',
    ]);

    expect(warn.mock.calls.map(([message]) => message).sort()).toEqual([
      `Failed to load plugin: ${origin}/tests/utils/fixtures/missing.js`,
      `Failed to load plugin: ${origin}/tests/utils/fixtures/missing_module.mjs`,
    ]);
  });

  it('only imports sources which end with a string of the endsWith array', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.spyOn(console, 'error').mockImplementation(() => {});

    await loadPlugins(
      [
        '/tests/utils/fixtures/missing_plugin.js',
        '/tests/utils/fixtures/missing_plugin.mjs',
        '/tests/utils/fixtures/missing.plugin.js',
      ],
      ['.plugin.js'],
    );

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      `Failed to load plugin: ${origin}/tests/utils/fixtures/missing.plugin.js`,
    );
  });

  it('imports a http source without the document origin', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.spyOn(console, 'error').mockImplementation(() => {});

    // The testhost does not serve the source.
    const src = `${mapp.host}/missing_http.mjs`;

    await loadPlugins([src]);

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      `Failed to load plugin: ${src}`,
    );
  });
});
