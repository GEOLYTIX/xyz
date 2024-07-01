import { base } from './_base.test.mjs';
import { layerTest } from './layer.test.mjs';

const mapview = await base();
await layerTest(mapview);