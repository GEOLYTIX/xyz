import { base } from './_base.test.mjs';
import { baseDictionaryTest } from '../lib/dictionaries/_dictionaries.test.mjs';
import { layerTest } from '../lib/layer/_layer.test.mjs';
import { locationTest } from '../lib/location/_location.test.mjs';
import { mapviewTest } from '../lib/mapview/_mapview.test.mjs';
import { resetView } from '../utils/reset_view.js';

// import { booleanTest } from '../lib/ui/locations/entries/boolean.test.mjs';

const mapview = await base();
await baseDictionaryTest();

resetView(mapview);
await layerTest.changeEndTest(mapview);

resetView(mapview);
await layerTest.decorateTest(mapview);

await layerTest.fadeTest();
await layerTest.featureFieldsTest();
await layerTest.featureFilterTest();
await layerTest.featureFormatsTest();
await layerTest.featureHoverTest();
await layerTest.featureStyleTest();
await layerTest.styleParserTest();

await locationTest.createTest();
await locationTest.getTest();
await locationTest.decorateTest();
await locationTest.nnearestTest();

await mapviewTest.addLayerTest();
await mapviewTest.allfeaturesTest();
await mapviewTest.attributionTest();
await mapviewTest.fitViewTest();
await mapviewTest.geoJSONTest();
await mapviewTest.geometryTest();
await mapviewTest.getBoundsTest();
await mapviewTest.infotipTest();
await mapviewTest.locateTest();
await mapviewTest.popupTest();
// await booleanTest();

