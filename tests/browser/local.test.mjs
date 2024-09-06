import { base } from '../../public/tests/_base.test.mjs';
import { layerTest } from '../lib/layer/_layer.test.mjs';
import { dictionaryTest } from '../lib/dictionaries/_dictionaries.test.mjs';
import { locationTest } from '../lib/location/_location.test.mjs';
import { mapviewTest } from '../lib/mapview/_mapview.test.mjs';
import { pluginsTest } from '../plugins/_plugins.test.mjs';
import { setView } from '../utils/view.js';
import { delayFunction } from '../utils/delay.js';
import { workspaceTest } from '../mod/workspace/_workspace.test.mjs'
import { queryTest } from '../mod/query.test.mjs';
import { apiTest } from './_api.test.mjs';
import { userTest } from '../mod/user/_user.test.js';
import { ui_elementsTest } from '../lib/ui/elements/_elements.test.mjs';
import { entriesTest } from '../lib/ui/locations/entries/_entires.test.mjs';
// import { booleanTest } from '../lib/ui/locations/entries/boolean.test.mjs';

//API Tests
await workspaceTest();
await queryTest();
await userTest.updateTest();

const mapview = await base();

// Run the dictionary Tests
await dictionaryTest.baseDictionaryTest(mapview);
await dictionaryTest.unknownLanguageTest(mapview);
await dictionaryTest.keyValueDictionaryTest(mapview);

await pluginsTest.linkButtonTest();
setView(mapview, 2, 'default');
await layerTest.changeEndTest(mapview);

setView(mapview, 2, 'default');
await layerTest.decorateTest(mapview);

setView(mapview, 2, 'default');
await layerTest.fadeTest(mapview);
// await layerTest.featureFieldsTest();
// await layerTest.featureFilterTest();
await layerTest.featureFormatsTest();
// await layerTest.featureHoverTest();
//await layerTest.featureStyleTest(mapview);
await layerTest.styleParserTest(mapview);

// await locationTest.createTest();
await locationTest.getTest(mapview);
// await locationTest.decorateTest();
// await locationTest.nnearestTest();

await mapviewTest.addLayerTest(mapview);
// await mapviewTest.allfeaturesTest();
// await mapviewTest.attributionTest();
// await mapviewTest.fitViewTest();
// await mapviewTest.geoJSONTest();
// await mapviewTest.geometryTest();
// await mapviewTest.getBoundsTest();
// await mapviewTest.infotipTest();
// await mapviewTest.locateTest();
// await mapviewTest.popupTest();
await ui_elementsTest.sliderTest();
await ui_elementsTest.layerStyleTest(mapview);
await entriesTest.pinTest(mapview);