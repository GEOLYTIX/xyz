/**
## ui/utils

The MAPP UI utils exports legacy methods to warn that plugins are required for the use of third party dataview libraries eg. Tabulator and Chart[js].

The idleLogout, imagePreview, resizeHandler utility methods are imported and added to the ui.utils{} object.

@requires /ui/utils/idleLogout
@requires /ui/utils/imagePreview
@requires /ui/utils/resizeHandler

@module /ui/utils
*/


function Tabulator(_this) {
  if(!_this.dataview) console.warn('Please change mapp.ui.utils.Tabulator to mapp.ui.utils.tabulator.create');
  return mapp.ui.utils.tabulator.create(_this);
}

function Chart(_this) {
  if(!_this.dataview) console.warn('Please change mapp.ui.utils.Chart to mapp.ui.utils.chartjs.create');
  return mapp.ui.utils.chartjs.create(_this);
}

import idleLogout from './idleLogout.mjs'

import imagePreview from './imagePreview.mjs'

import resizeHandler from './resizeHandler.mjs'

export default {
  Chart,
  Tabulator,
  idleLogout,
  imagePreview,
  resizeHandler,
}