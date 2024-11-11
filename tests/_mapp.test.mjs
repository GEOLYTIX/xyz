import { base } from '../public/tests/_base.test.mjs';
import { mappTest } from './lib/mapp.test.mjs';
import { layerTest } from './lib/layer/_layer.test.mjs';
import { dictionaryTest } from './lib/dictionaries/_dictionaries.test.mjs';
import { locationTest } from './lib/location/_location.test.mjs';
import { mapviewTest } from './lib/mapview/_mapview.test.mjs';
import { pluginsTest } from './plugins/_plugins.test.mjs';
import { workspaceTest } from './mod/workspace/_workspace.test.mjs';
import { queryTest } from './mod/query.test.mjs';
import { userTest } from './mod/user/_user.test.js';
import { ui_elementsTest } from './lib/ui/elements/_elements.test.mjs';
import { ui_layers } from './lib/ui/layers/_layers.test.mjs';
import { entriesTest } from './lib/ui/locations/entries/_entries.test.mjs';
import { uiTest } from './lib/ui/_ui.test.mjs';
import { utilsTest } from './lib/utils/_utils.test.mjs';
import { formatTest } from './lib/layer/format/_format.test.mjs';
import { ui_locations } from './lib/ui/locations/_locations.test.mjs';

self._mappTest = {
    base,
    mappTest,
    layerTest,
    dictionaryTest,
    locationTest,
    mapviewTest,
    pluginsTest,
    workspaceTest,
    queryTest,
    userTest,
    ui_elementsTest,
    ui_layers,
    entriesTest,
    uiTest,
    utilsTest,
    formatTest,
    ui_locations,
}