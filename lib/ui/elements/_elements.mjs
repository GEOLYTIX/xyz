/**
### mapp.ui.elements{}

Module to export all the ui element functions used in mapp.
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
import modal from './modal.mjs';
import searchbox from './searchbox.mjs';
import slider from './slider.mjs';
import slider_ab from './slider_ab.mjs';
import { numericFormatter, getSeparators } from './numericFormatter.mjs';
import pillComponent from './pillComponent.mjs'

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
@property {Function} modal - Modal component.
@property {Function} searchbox - Searchbox component.
@property {Function} slider - Slider component.
@property {Function} slider_ab - Slider with A/B comparison component.
@property {Function} numericFormatter - Numeric formatter function.
@property {Function} getSeparators - Function to get numeric separators.
@property {Function} pillComponent - pill component.

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
  legendIcon,
  modal,
  pillComponent,
  searchbox,
  slider,
  slider_ab,
  numericFormatter,
  getSeparators
};