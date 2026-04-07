import { layerExtentTests } from './layer_extent.test.mjs';
import { tableSchemaTests } from './table_schema.test.mjs';

await codi.describe({ name: 'templates:', id: 'templates' }, () => {
  layerExtentTests();
  tableSchemaTests();
});
