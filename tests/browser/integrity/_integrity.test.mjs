import { layerTest } from './layer.test.mjs';
import { workspaceTest } from './workspace.test.mjs';

export async function integrityTests(mapview) {
  await workspaceTest(mapview);
  await layerTest(mapview);
}
