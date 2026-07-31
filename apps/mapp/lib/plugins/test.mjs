/**
### Test plugin

This plugin runs the integrity tests on a deployed instance.

Integrity tests assert that the instance is correctly configured -- that its
workspace resolves, its layers have reachable sources, and its database
connections answer. That is a property of the running deployment, so it is
checked in the browser against the live instance.

The core front end tests have migrated to Vitest and run headlessly in CI with
`pnpm test`. The `?test=core` param no longer does anything. See TESTING.md.

To provide test params to the plugin you can provide a test object to a locale.

```json
"test": {
  "quiet": true, <-- will only show errors (Defaults to false)
  "showSummary": true, <-- will show a summary (Default to false)
},
```

To run the integrity tests provide the `test` param as part of the url params.

eg.

`/?test=integrity` - run the integrity tests

@module /plugins/test
*/

/**
Adds the integrity tests to the mapp.plugins object to be run on a workspace.
@function test
@param {Object} plugin - The plugin configuration object.
@param {Object} mapview - The mapview object.
@returns {void}
*/
export async function test(plugin, mapview) {
  if (mapp.hooks.current.test !== 'integrity') return;

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
      // The integrity entry of the mapp Vite build, see vite.config.mjs. The
      // host is only known at runtime, so the hint keeps bundlers from
      // attempting to analyse and resolve the URL at build time.
      await import(
        /* @vite-ignore */ `${mapp.host}/public/js/lib/integrity.js`
      );
    }
  } catch (error) {
    console.log(error);
  }

  if (!codi) return;

  mapview.Map.once('loadend', async () => {
    await codi.runWebTestFunction(
      () => _mappTest.integrityTests(mapview),
      plugin,
    );
  });
}
