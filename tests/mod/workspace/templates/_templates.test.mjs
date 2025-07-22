import { layerExtentTests } from './layer_extent.test.mjs';

await codi.describe({ name: 'templates:', id: 'templates' }, () => {
  layerExtentTests();
});
