import { addLayer } from './addLayer.test.mjs';
import { removeLayer } from './removeLayer.test.mjs';

export const mapviewTest = {
  setup,
  addLayer,
  removeLayer,
};

function setup() {
  codi.describe({ name: 'Mapview:', id: 'mapview' }, () => {});
}
