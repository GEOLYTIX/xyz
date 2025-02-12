import { coreTest } from './browser/local.test.mjs';
import { mappTest } from './lib/mapp.test.mjs';
import { layer } from './lib/layer/_layer.test.mjs';
import { dictionaryTest } from './lib/dictionaries/_dictionaries.test.mjs';
import { locationTest } from './lib/location/_location.test.mjs';
import { mapviewTest } from './lib/mapview/_mapview.test.mjs';
import { uiTest } from './lib/_ui.test.mjs';
import { utilsTest } from './lib/utils/_utils.test.mjs';
import { integrationTests } from './browser/integration/_integration.test.mjs';

globalThis._mappTest = {
  coreTest,
  mappTest,
  integrationTests,
  layer,
  dictionaryTest,
  locationTest,
  mapviewTest,
  uiTest,
  utilsTest,
};
