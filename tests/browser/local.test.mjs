import { base } from '../../public/tests/_base.test.mjs';
import { layerTest } from '../lib/layer/_layer.test.mjs';
import { dictionaryTest } from '../lib/dictionaries/_dictionaries.test.mjs';
import { locationTest } from '../lib/location/_location.test.mjs';
import { mapviewTest } from '../lib/mapview/_mapview.test.mjs';
import { pluginsTest } from '../plugins/_plugins.test.mjs';
import { setView } from '../utils/view.js';
import { workspaceTest } from '../mod/workspace/_workspace.test.mjs'
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
await layerTest.featureFieldsTest();
await layerTest.featureFormatsTest();
await layerTest.styleParserTest(mapview);

await locationTest.getTest(mapview);

await mapviewTest.addLayerTest(mapview);
await mapviewTest.olControlsTest(mapview);

await ui_elementsTest.sliderTest();
await ui_elementsTest.layerStyleTest(mapview);
await ui_elementsTest.pillsTest();
await ui_elementsTest.alertTest();
await ui_elementsTest.confirmTest();
await ui_elementsTest.dialogTest();

await entriesTest.pinTest(mapview);
await entriesTest.geometryTest(mapview);

await ui_layers.filtersTest(mapview);

await uiTest.Tabview();

await utilsTest.numericFormatterTest();
await utilsTest.mergeTest();

await formatTest.vectorTest(mapview);

await ui_locations.infojTest();
