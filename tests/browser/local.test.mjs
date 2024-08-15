import { base } from '../../public/tests/_base.test.mjs';
import { layerTest } from '../lib/layer/_layer.test.mjs';
import { dictionaryTest } from '../lib/dictionaries/_dictionaries.test.mjs';
import { locationTest } from '../lib/location/_location.test.mjs';
import { mapviewTest } from '../lib/mapview/_mapview.test.mjs';
import { setView } from '../utils/view.js';
import { delayFunction } from '../utils/delay.js';
import { workspaceTest } from '../mod/workspace/_workspace.test.mjs'
import { apiTest } from './_api.test.mjs';
// import { booleanTest } from '../lib/ui/locations/entries/boolean.test.mjs';

//API Tests
await workspaceTest();

const mapview = await base();
// Run the dictionary Tests
await dictionaryTest.baseDictionaryTest(mapview);
await dictionaryTest.keyValueDictionaryTest(mapview);


setView(mapview, 2, 'default');
await layerTest.changeEndTest(mapview);

setView(mapview, 2, 'default');
await layerTest.decorateTest(mapview);

setView(mapview, 2, 'default');
await layerTest.fadeTest(mapview);
// await layerTest.featureFieldsTest();
// await layerTest.featureFilterTest();
// await layerTest.featureFormatsTest();
// await layerTest.featureHoverTest();
// await layerTest.featureStyleTest();
await layerTest.styleParserTest(mapview);

// await locationTest.createTest();
// await locationTest.getTest();
// await locationTest.decorateTest();
// await locationTest.nnearestTest();

// await mapviewTest.addLayerTest();
// await mapviewTest.allfeaturesTest();
// await mapviewTest.attributionTest();
// await mapviewTest.fitViewTest();
// await mapviewTest.geoJSONTest();
// await mapviewTest.geometryTest();
// await mapviewTest.getBoundsTest();
// await mapviewTest.infotipTest();
// await mapviewTest.locateTest();
// await mapviewTest.popupTest();
// await booleanTest();