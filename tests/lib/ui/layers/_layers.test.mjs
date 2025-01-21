import { filters } from './filters.test.mjs';
import { filter } from './panels/filter.test.mjs';
import { view } from './view.test.mjs';

export const layers = {
  setup,
  filters,
  panels: {
    filter,
  },
  view,
};

function setup() {
  codi.describe({ name: 'UI Layers:', id: 'ui_layers' }, () => {});
}
