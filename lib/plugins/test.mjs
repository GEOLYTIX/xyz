import * as codi from 'https://esm.sh/codi-test-framework@1.0.37';

let options;

export async function test(plugin, mapview) {
  options = plugin.options;
  mapp.plugins.integrityTests = integrityTests;

  if (plugin.core && mapp.hooks.current.test === 'core') {
    await codi.runWebTestFunction(() => _mappTest.coreTest(mapview), options);
    return;
  }
}

async function integrityTests(mapview) {
  await codi.runWebTestFunction(() => _mappTest.integrityTests(mapview));
  return;
}
