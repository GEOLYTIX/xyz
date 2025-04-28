import { entries } from './entries/_entries.test.mjs';
import { infoj } from './infoj.test.mjs';

export const locations = {
  setup,
  entries,
  infoj,
};

function setup() {
  codi.describe({ name: 'UI Locations:', id: 'ui_locations' }, () => {});
}
