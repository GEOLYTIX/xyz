import * as codi from 'https://esm.sh/codi-test-framework@1.0.33';

let _mapview;

export async function test(plugin, mapview) {
  // mapp.plugins.testLayer = testLayer;
  //
  if (mapp.hooks.current.test === 'integration') {
    console.log('adding the intergration tests');
    mapp.plugins.integrationTests = integrationTests;
  }

  _mapview = mapview;

  if (plugin.core && mapp.hooks.current.test === 'core') {
    await codi.runWebTestFunction(
      () => _mappTest.coreTest(mapview),
      plugin.options,
    );
    return;
  }
}

async function testLayer(plugin, mapview) {
  if (plugin.testLayer?.key) {
    await codi.runWebTestFunction(_mappTest[plugin.testLayer.key]);
  }
}
//
// async function format(layer) {
//   await _mappTest.integrationTests.layerTest(layer, _mapview);
// }

async function integrationTests(mapview) {
  await codi.runWebTestFunction(() => _mappTest.integrationTests(mapview));
  return;
}
