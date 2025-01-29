/**
## mapp/ui/elements

@module /ui/elements
*/

import card from './card.mjs';
import chkbox from './chkbox.mjs';
import contextMenu from './contextMenu.mjs';
import drawer from './drawer.mjs';
import drawing from './drawing.mjs';
import dropdown from './dropdown.mjs';
import dropdown_multi from './dropdown_multi.mjs';
import btnPanel from './btnPanel.mjs';
import legendIcon from './legendIcon.mjs';
import dialog from './dialog.mjs';
import alert from './alert.mjs';
import confirm from './confirm.mjs';
import helpDialog from './helpDialog.mjs';
import searchbox from './searchbox.mjs';
import slider from './slider.mjs';
import slider_ab from './slider_ab.mjs';
import layerStyle from './layerStyle.mjs';
import pills from './pills.mjs';
import numericInput from './numericInput.mjs';
import themeLegendSwitch from './themeLegendSwitch.mjs';

/**
UI elements object containing various UI components.
@typedef {Object} UIElements
@property {Function} btnPanel - Button panel component.
@property {Function} card - Card component.
@property {Function} chkbox - Checkbox component.
@property {Function} contextMenu - Context menu component.
@property {Function} drawer - Drawer component.
@property {Function} drawing - Drawing component.
@property {Function} dropdown - Dropdown component.
@property {Function} dropdown_multi - Multi-select dropdown component.
@property {Function} legendIcon - Legend icon component.
@property {Function} dialog - Dialog component.
@property {Function} alert - Alert component.
@property {Function} confirm - Confirm component.
@property {Function} helpDialog - Help Dialog component.
@property {Function} searchbox - Searchbox component.
@property {Function} slider - Slider component.
@property {Function} slider_ab - Slider with A/B comparison component.
@property {Function} pills - pills component.

Exporting UI elements.
@type {UIElements}
*/
export default {
  btnPanel,
  card,
  chkbox,
  contextMenu,
  drawer,
  drawing,
  dropdown,
  dropdown_multi,
  numericInput,
  layerStyle,
  legendIcon,
  dialog,
  alert,
  confirm,
  pills,
  helpDialog,
  searchbox,
  slider,
  slider_ab,
  themeLegendSwitch,
};
