import { layerTest } from './layer.test.mjs';
import { workspaceTest } from './workspace.test.mjs';

export async function integrationTests(mapview) {
  console.log(mapview);
  await layerTest(mapview);
  await workspaceTest(mapview);
}
