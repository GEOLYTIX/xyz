import { featureExtentTests } from './feature_extent.test.mjs';

await codi.describe({ name: 'templates:', id: 'templates' }, () => {
  featureExtentTests();
});
