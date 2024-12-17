import { coreTest } from './browser/local.test.mjs';
import { mappTest } from './lib/mapp.test.mjs';
import { layer } from './lib/layer/_layer.test.mjs';
import { dictionaryTest } from './lib/dictionaries/_dictionaries.test.mjs';
import { locationTest } from './lib/location/_location.test.mjs';
import { mapviewTest } from './lib/mapview/_mapview.test.mjs';
import { workspaceSuite } from './mod/workspace/_workspace.test.mjs';
import { templatesTest } from './mod/workspace/templates/_templates.test.mjs';
import { queryTest } from './mod/query.test.mjs';
import { userTest } from './mod/user/_user.test.js';
import { uiTest } from './lib/_ui.test.mjs';
import { utilsTest } from './lib/utils/_utils.test.mjs';

globalThis._mappTest = {
    coreTest,
    mappTest,
    layer,
    dictionaryTest,
    locationTest,
    mapviewTest,
    workspaceSuite,
    templatesTest,
    queryTest,
    userTest,
    uiTest,
    utilsTest
}