import { elements } from './ui/elements/_elements.test.mjs';
import { layers } from './ui/layers/_layers.test.mjs';
import { locations } from './ui/locations/_locations.test.mjs';

export const uiTest = {
  setup,
  layers,
  locations,
  elements,
};

function setup() {
  codi.describe({ name: 'UI:', id: 'ui' }, () => {});
}
