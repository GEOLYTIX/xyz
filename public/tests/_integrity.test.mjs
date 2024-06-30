import { base } from './_base.test.mjs';
import { layerTest } from './layer.test.mjs';
import { uiElementsTest } from './lib/ui/_ui.test.mjs';

const mapview = await base();
await layerTest(mapview);
await uiElementsTest(mapview);