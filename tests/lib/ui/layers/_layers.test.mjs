import { filtersTest } from './filters.test.mjs';
import { panelFilterTest } from './panels/filter.test.mjs'
import { viewTest } from './view.test.mjs';

export const ui_layers = {
    setup,
    filtersTest,
    panelFilterTest,
    viewTest
}

function setup() {
    codi.describe({ name: 'UI Layers:', id: 'ui_layers' }, () => { });
}