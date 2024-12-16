import { sliderTest } from './slider.test.mjs';
import { layerStyleTest } from './layerStyle.test.mjs'
import { pillsTest } from './pills.test.mjs';
import { alertTest } from './alert.test.mjs';
import { confirmTest } from './confirm.test.mjs';
import { dialogTest } from './dialog.test.mjs';

export const ui_elementsTest = {
    setup,
    sliderTest,
    layerStyleTest,
    pillsTest,
    alertTest,
    confirmTest,
    // dialogTest
};

function setup() {
    codi.describe({ name: 'UI Elements:', id: 'ui_elements' }, () => { })
}