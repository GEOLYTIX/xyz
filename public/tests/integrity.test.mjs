import { base } from './_base.test.mjs';
import { layerTest } from './layer.test.mjs';
import { workspaceTest } from './workspace.test.mjs';

const mapview = await base();
await layerTest(mapview);
await workspaceTest(mapview); 