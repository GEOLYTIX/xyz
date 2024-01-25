import Chart from './Chart.mjs'

import tabulator from './tabulator.mjs'

function Tabulator(_this) {
  console.warn('Please change mapp.ui.utils.Tabulator to mapp.ui.utils.tabulator.create');
  return mapp.ui.utils.tabulator.create(_this);
}

//import tabulator from './tabulatorUtils.mjs'

import idleLogout from './idleLogout.mjs'

import imagePreview from './imagePreview.mjs'

import resizeHandler from './resizeHandler.mjs'

export default {
  Chart,
  tabulator,
  Tabulator,
  idleLogout,
  imagePreview,
  resizeHandler,
}