/**
### Test plugin

This plugin is used to run the integrity test on any instance.

The integrity test requests the workspace test from the XYZ API with the layers param. The API checks the workspace sources and the queries for every layer in the current locale. The results are logged to the console.

Admin credentials are required for the workspace test.

To provide test params to the plugin you can provide a test object to a locale.

```json
"test": {
  "quiet": true, <-- will only show errors (Defaults to false)
  "showSummary": true, <-- will show a summary (Default to true)
},
```
To run the test you can provide the `test` param as part of the url params.

eg.

`/?test=integrity` - run the integrity test

The core front end tests are run with Vitest. See TESTING.md.

@module /plugins/test
*/

/**
Requests the workspace integrity test for the current locale and logs the results to the console.
@function test
@async
@param {Object} plugin - The plugin configuration object.
@param {Object} mapview - The mapview object.
@returns {Promise<void>}
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

  if (mapp.hooks.current.test === 'core') {
    console.warn(
      'The core browser tests have been removed. Run the front end tests with `pnpm test`.',
    );
    return;
  }

  if (mapp.hooks.current.test !== 'integrity') return;

  // The key for a nested locale is the comma separated keys array.
  const locale = mapview.locale.keys?.join(',') || mapview.locale.key;

  let result;

  try {
    result = await mapp.utils.xhr(
      `${mapp.host}/api/workspace/test?${mapp.utils.paramString({
        layers: true,
        locale,
      })}`,
    );
  } catch (err) {
    console.error(
      err.message === 'HTTP 403'
        ? 'Admin credentials are required to run integrity tests.'
        : err,
    );
    return;
  }

  logResult(result, plugin, locale);
}

/**
Logs the workspace test result to the console as a single group.

The group has one table with a row for every source error, locale and layer error, and template warning. The type column of a row is the type of the error. Template warnings are not logged for a quiet test.

The report with the number of layers checked, errors, and timing of the test is logged after the table.
@function logResult
@param {Object} result - The workspace test result.
@param {Object} plugin - The plugin configuration object.
@param {string} locale - The locale key.
@property {boolean} plugin.quiet - Only log errors.
@property {boolean} plugin.showSummary - Log the report of the test.
*/
function logResult(result, plugin, locale) {
  const { layers, srcErr, templateWarn } = result;

  // The duration of the layer check for layer error rows.
  const layerDuration = new Map(
    layers.failed_layers.map((failed) => [
      `${failed.locale}.${failed.layer}`,
      failed.duration_ms,
    ]),
  );

  const rows = [
    ...srcErr.map((error) => ({ type: 'source', error })),
    ...layers.errors.map((err) => ({
      type: err.layer ? 'layer' : 'locale',
      locale: err.locale,
      layer: err.layer,
      template: err.template,
      table: err.table,
      themes: err.themes?.join(', '),
      error: err.error,
      layer_ms: layerDuration.get(`${err.locale}.${err.layer}`),
    })),
    ...(plugin.quiet ? [] : templateWarn).map((error) => ({
      type: 'template warning',
      error,
    })),
  ];

  const errorCount = srcErr.length + layers.errors.length;

  const errorSummary = errorCount ? `${errorCount} errors` : 'no errors';

  console.group(`Integrity test: ${locale}, ${errorSummary}`);

  if (rows.length) {
    console.table(rows, [
      'type',
      'locale',
      'layer',
      'template',
      'table',
      'themes',
      'error',
      'layer_ms',
    ]);
  }

  if (plugin.showSummary) {
    console.log(
      [
        `Layers checked: ${layers.checked}`,
        `Layers failed: ${layers.failed}`,
        `Layer errors: ${layers.errors.length}`,
        `Source errors: ${srcErr.length}`,
        `Template warnings: ${templateWarn.length}`,
        `Started: ${layers.start}`,
        `Finished: ${layers.end}`,
        `Duration: ${layers.duration_ms} ms`,
      ].join('\n'),
    );
  }

  console.groupEnd();
}
