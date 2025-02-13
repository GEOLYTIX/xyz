import * as codi from 'https://esm.sh/codi-test-framework@1.0.33';

export async function test(plugin, mapview) {
  if (mapp.hooks.current.test === 'integration') {
    mapp.plugins.integrationTests = integrationTests;
  }

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

async function integrationTests(mapview) {
  await codi.runWebTestFunction(() => _mappTest.integrationTests(mapview));
  return;
}
