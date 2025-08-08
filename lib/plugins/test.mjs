/**
### Test plugin

This plugin is used to run different kinds of tests on any instance.
- Core
- Integrity

To provide test params to the plugin you can provide a test object to a locale.

```json
"test": {
  "quiet": true, <-- will only show errors (Defaults to false)
  "showSummary": true, <-- will show a summary (Default to false)
},
```
To run the different tests you can provide the `test` param as part of the url params.

eg.

`/?test=core` - run the core front end tests
`/?test=integrity` - run the integrity tests

TODO: The current core & integrity tests are going to be restructured and reinvisioned in the next iteration.

@module /plugins/test
*/

/**
Adds the core & integrity tests to the mapp.plugins object to be run on a workspace.
@function test
@param {Object} plugin - The plugin configuration object.
@param {Object} mapview - The mapview object.
@returns {void}
*/
export async function test(plugin, mapview) {
  if (!mapp.hooks.current.test) return;

  plugin = Object.assign({}, plugin, {
    quiet: plugin?.quiet ?? false,
    showSummary: plugin?.showSummary ?? true,
  });

  if (plugin.options) {
    plugin = plugin.options;
    console.warn(
      'please move the options properties into the test plugin object',
    );
  }

  try {
    await mapp.utils.esmImport('codi-test-framework@1.0.37');

    if (!globalThis._mappTest) {
      await import(`${mapp.host}/public/js/tests/_mapp.test.js`);
    }
  } catch (error) {
    console.log(error);
  }

  if (!codi) return;

  if (mapp.hooks.current.test === 'integrity') {
    mapview.Map.once('loadend', async () => {
      await codi.runWebTestFunction(
        () => _mappTest.integrityTests(mapview),
        plugin,
      );
    });
  }

  if (mapp.hooks.current.test === 'core') {
    await codi.runWebTestFunction(() => _mappTest.coreTest(mapview), plugin);
  }
}
