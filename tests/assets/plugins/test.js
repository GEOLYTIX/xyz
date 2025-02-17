import * as codi from 'https://esm.sh/codi-test-framework@1.0.33';

mapp.plugins.test = test;

async function test(plugin, mapview) {
  if (plugin.core) {
    await codi.runWebTestFunction(
      () => _mappTest.coreTest(mapview),
      plugin.options,
    );
    return;
  }
}

mapp.plugins.testLayer = testLayer;

async function testLayer(plugin, mapview) {
  console.log(plugin);

  if (plugin.testLayer?.key) {
    console.log(plugin.testLayer.key);
    await codi.runWebTestFunction(_mappTest[plugin.testLayer.key]);
  }
}
