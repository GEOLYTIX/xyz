import * as codi from 'https://esm.sh/codi-test-framework@1.0.33';

let _mapview;

async function integrationTest(mapview) {
  if (mapp.hooks.current.integration) {
    await codi.runWebTestFunction(() => _mappTest.integrationTest(mapview));
  }
}

export async function test(plugin, mapview) {
  // mapp.plugins.integrationTest = integrationTest;
  // mapp.plugins.testLayer = testLayer;

  mapp.plugins.format = format;
  _mapview = mapview;
  // if (plugin.core && !mapp.hooks.current.integration) {
  //   await codi.runWebTestFunction(
  //     () => _mappTest.coreTest(mapview),
  //     plugin.options,
  //   );
  //   return;
  // }
}

async function testLayer(plugin, mapview) {
  if (plugin.testLayer?.key) {
    await codi.runWebTestFunction(_mappTest[plugin.testLayer.key]);
  }
}

async function format(layer) {
  await _mappTest.integrationTests.layerTest(layer, _mapview);
}
