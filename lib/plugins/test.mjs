/**
### Test plugin

This plugin is used to run different kinds of tests on any instance.
- Core
- Integrity

To provide test params to the plugin you can provide a test object to a locale.

```json
"test": {
  "options": { <-- Options passed to the runWebTestFunction
    "quiet": true, <-- will only show errors (Defaults to false)
    "showSummary": true, <-- will show a summary (Default to false)
  }
},
```
To run the different tests you can provide the `test` param as part of the url params.

eg.

`/?test=core` - run the core front end tests
`/?test=integrity` - run the integrity tests

TODO: The current core & integrity tests are going to be restructured and reinvisioned in the next iteration.

@module /plugins/test
*/

let options;

/**
Adds the core & integrity tests to the mapp.plugins object to be run on a workspace.
@function test
@param {Object} plugin - The plugin configuration object.
@param {Object} mapview - The mapview object.
@returns {void}
*/
export async function test(plugin, mapview) {
  try {
    await import('https://esm.sh/codi-test-framework@1.0.37');
  } catch (error) {
    console.log(error);
  }

  if (!codi) return;

  options = plugin.options;

  //TODO: A better solution coming in the next interation
  //Assigning the integrityTest to the plugin object to be executed in the default view.
  mapp.plugins.integrityTests = integrityTests;

  if (mapp.hooks.current.test === 'core') {
    await codi.runWebTestFunction(() => _mappTest.coreTest(mapview), options);
  }
}

/**
Runs the integrityTests
@function integrityTests 
@param {Object} mapview - The mapview object.
@returns {void}
*/
async function integrityTests(mapview) {
  await codi.runWebTestFunction(
    () => _mappTest.integrityTests(mapview),
    options,
  );
}
