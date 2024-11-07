import { base } from '../../public/tests/_base.test.mjs';
import { mappTest } from '../lib/mapp.test.mjs';
import { layerTest } from '../lib/layer/_layer.test.mjs';
import { dictionaryTest } from '../lib/dictionaries/_dictionaries.test.mjs';
import { locationTest } from '../lib/location/_location.test.mjs';
import { mapviewTest } from '../lib/mapview/_mapview.test.mjs';
import { pluginsTest } from '../plugins/_plugins.test.mjs';
import { workspaceTest } from '../mod/workspace/_workspace.test.mjs'
import { templatesTest } from '../mod/workspace/templates/_templates.test.mjs';
import { queryTest } from '../mod/query.test.mjs';
import { userTest } from '../mod/user/_user.test.js';
import { ui_elementsTest } from '../lib/ui/elements/_elements.test.mjs';

import { ui_layers } from '../lib/ui/layers/_layers.test.mjs';
import { entriesTest } from '../lib/ui/locations/entries/_entries.test.mjs';
import { uiTest } from '../lib/ui/_ui.test.mjs';
import { utilsTest } from '../lib/utils/_utils.test.mjs';
import { formatTest } from '../lib/layer/format/_format.test.mjs';
import { ui_locations } from '../lib/ui/locations/_locations.test.mjs';

//API Tests
await workspaceTest();
await queryTest();
await runAllTests(templatesTest);

await runAllTests(userTest);

const mapview = await base();

await runAllTests(mappTest);

// Run the dictionary Tests
await runAllTests(dictionaryTest, mapview);

//Plugins Tests
await runAllTests(pluginsTest);

//Layer Tests
await runAllTests(layerTest, mapview);

//Location Tests
await runAllTests(locationTest, mapview);

//Mapview Tests
await runAllTests(mapviewTest, mapview);

//UI Elements Tests
await runAllTests(ui_elementsTest, mapview);

//Entries Tests
await runAllTests(entriesTest, mapview);

//UI Layers Tests
await runAllTests(ui_layers, mapview);

//UI tests
await runAllTests(uiTest);

//Format Tests
await runAllTests(formatTest, mapview);

//UI Locations Tests
await runAllTests(ui_locations, mapview);

//Utils Tests
await runAllTests(utilsTest, mapview);

/**
 * This function is used to execute all the test functions on the exported test object. 
 * @function runAllTests
 * @param {object} tests 
 * @param {object} mapview 
 */
async function runAllTests(tests, mapview) {
    const testFunctions = Object.values(tests).filter(item => typeof item === 'function');

    for (const testFn of testFunctions) {
        try {
            await testFn(mapview);
        } catch (error) {
            console.error(`Error in test ${testFn.name}:`, error);
        }
    }
}