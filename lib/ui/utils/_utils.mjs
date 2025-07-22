/**
## ui/utils

The MAPP UI utils exports legacy methods to warn that plugins are required for the use of third party dataview libraries eg. Tabulator and Chart[js].

The idleLogout, imagePreview, resizeHandler utility methods are imported and added to the ui.utils{} object.

@requires /ui/utils/cssColourTheme
@requires /ui/utils/dataview
@requires /ui/utils/dataviewDialog
@requires /ui/utils/histogram
@requires /ui/utils/idleLogout
@requires /ui/utils/imagePreview
@requires /ui/utils/jsonDataview
@requires /ui/utils/layerJSE
@requires /ui/utils/locationCount
@requires /ui/utils/resizeHandler

@module /ui/utils
*/

/**
@function Tabulator
@deprecated

@description
The deprecated `mapp.ui.utils.Tabulator()` method will warn if used.

The Tabulator dataview plugin must be loaded in order to create Tabulator dataviews.
*/

function Tabulator(_this) {
  console.warn(
    'Please change mapp.ui.utils.Tabulator() to mapp.ui.utils.tabulator.create() which requires the Tabulator dataview plugin to be loaded.',
  );
}

/**
@function Chart
@deprecated

@description
The deprecated `mapp.ui.utils.Chart()` method will warn if used.

The ChartJS dataview plugin must be loaded in order to create ChartJS dataviews.
*/

function Chart(_this) {
  console.warn(
    'Please change mapp.ui.utils.Chart() to mapp.ui.utils.chartjs.create() which requires the ChartJS dataview plugin to be loaded.',
  );
}

import * as cssColour from './cssColourTheme.mjs';
import dataview from './dataview.mjs';
import dataviewDialog from './dataviewDialog.mjs';
import histogram from './histogram.mjs';
import idleLogout from './idleLogout.mjs';
import imagePreview from './imagePreview.mjs';
import jsonDataview from './jsonDataview.mjs';
import layerJSE from './layerJSE.mjs';
import locationCount from './locationCount.mjs';
import resizeHandler from './resizeHandler.mjs';

export default {
  Chart,
  cssColour,
  dataview,
  dataviewDialog,
  histogram,
  idleLogout,
  imagePreview,
  Json: jsonDataview,
  layerJSE,
  locationCount,
  resizeHandler,
  Tabulator,
};
