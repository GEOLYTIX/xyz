import { slider } from './slider.test.mjs';
import { layerStyle } from './layerStyle.test.mjs'
import { pills } from './pills.test.mjs';
import { alert } from './alert.test.mjs';
import { confirm } from './confirm.test.mjs';
import { dialog } from './dialog.test.mjs';

export const elements = {
    setup,
    slider,
    layerStyle,
    pills,
    alert,
    confirm,
    dialog
};

function setup() {
    codi.describe({ name: 'UI Elements:', id: 'ui_elements' }, () => { })
}