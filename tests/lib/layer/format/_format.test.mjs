import { mvt } from './mvt.test.mjs';
import { vector } from './vector.test.mjs';

export const formats = {
  setup,
  vector,
  mvt,
};

function setup() {
  codi.describe(
    { name: 'format:', id: 'layer_format', parentId: 'layer' },
    () => {},
  );
}
