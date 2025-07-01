import { filters } from './filters.test.mjs';
import { basic } from './legends/basic.test.mjs';
import { categorized } from './legends/categorized.test.mjs';
import { graduated } from './legends/graduated.test.mjs';
import { dataviews } from './panels/dataviews.test.mjs';
import { filter } from './panels/filter.test.mjs';
import { view } from './view.test.mjs';

export const layers = {
  setup,
  filters,
  panels: {
    filter,
    dataviews,
  },
  legends: {
    basic,
    graduated,
    categorized,
  },
  view,
};

function setup() {
  codi.describe({ name: 'UI Layers:', id: 'ui_layers' }, () => {});
}
