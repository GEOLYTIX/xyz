import { alert } from './alert.test.mjs';
import { confirm } from './confirm.test.mjs';
import { dialog } from './dialog.test.mjs';
import { dropdown } from './dropdown.test.mjs';
import { layerStyle } from './layerStyle.test.mjs';
import { pills } from './pills.test.mjs';
import { slider } from './slider.test.mjs';

export const elements = {
  alert,
  confirm,
  dialog,
  dropdown,
  layerStyle,
  pills,
  setup,
  slider,
};

function setup() {
  codi.describe({ id: 'ui_elements', name: 'UI Elements:' }, () => {});
}
