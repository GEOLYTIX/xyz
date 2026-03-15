/**
## /ui/elements

The module exports a collection of ui element modules.

@module /ui/elements

@requires module:/ui/elements/alert
@requires module:/ui/elements/btnPanel
@requires module:/ui/elements/card
@requires module:/ui/elements/chkbox
@requires module:/ui/elements/confirm
@requires module:/ui/elements/contextMenu
@requires module:/ui/elements/control
@requires module:/ui/elements/dialog
@requires module:/ui/elements/drawer
@requires module:/ui/elements/drawing
@requires module:/ui/elements/dropdown
@requires module:/ui/elements/dropdown_multi
@requires module:/ui/elements/helpDialog
@requires module:/ui/elements/jsoneditor
@requires module:/ui/elements/layerStyle
@requires module:/ui/elements/legendIcon
@requires module:/ui/elements/loginForm
@requires module:/ui/elements/numericInput
@requires module:/ui/elements/pills
@requires module:/ui/elements/registerForm
@requires module:/ui/elements/searchbox
@requires module:/ui/elements/slider
@requires module:/ui/elements/slider_ab
@requires module:/ui/elements/themeLegendSwitch
@requires module:/ui/elements/toast
@requires module:/ui/elements/tooltip
@requires module:/ui/elements/userLocale
*/

import alert from './alert.mjs';
import btnPanel from './btnPanel.mjs';
import card from './card.mjs';
import chkbox from './chkbox.mjs';
import confirm from './confirm.mjs';
import contextMenu from './contextMenu.mjs';
import control from './control.mjs';
import dialog from './dialog.mjs';
import { drawer, drawerDialog } from './drawer.mjs';
import drawing from './drawing.mjs';
import dropdown from './dropdown.mjs';
import helpDialog from './helpDialog.mjs';
import jsoneditor from './jsoneditor.mjs';
import layerStyle from './layerStyle.mjs';
import legendIcon from './legendIcon.mjs';
import locales from './locales.mjs';
import loginForm from './loginForm.mjs';
import numericInput from './numericInput.mjs';
import pills from './pills.mjs';
import radio from './radio.mjs';
import registerForm from './registerForm.mjs';
import reportLink from './reportLink.mjs';
import searchbox from './searchbox.mjs';
import slider from './slider.mjs';
import slider_ab from './slider_ab.mjs';
import themeLegendSwitch from './themeLegendSwitch.mjs';
import toast from './toast.mjs';
import tooltip from './tooltip.mjs';
import userLocale from './userLocale.mjs';

export default {
  alert,
  btnPanel,
  card,
  chkbox,
  confirm,
  contextMenu,
  control,
  dialog,
  drawer,
  drawerDialog,
  drawing,
  dropdown,
  helpDialog,
  jsoneditor,
  layerStyle,
  legendIcon,
  locales,
  loginForm,
  numericInput,
  pills,
  radio,
  reportLink,
  registerForm,
  searchbox,
  slider,
  slider_ab,
  themeLegendSwitch,
  toast,
  tooltip,
  userLocale,
};
