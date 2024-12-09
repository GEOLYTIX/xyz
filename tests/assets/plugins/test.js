import * as codi from 'https://esm.sh/codi-test-framework@1.0.8';

mapp.plugins.test = test;

async function test(plugin, mapview) {

    console.log(plugin.core);

    globalThis.codi = codi;

    if (plugin.core) {
        await codi.runWebTestFunction(_mappTest.coreTest, plugin.options);
    }
}

async function testLayer(plugin, mapview) {

}