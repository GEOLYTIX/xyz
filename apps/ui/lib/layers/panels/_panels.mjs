/**
## /ui/layers/panels

The panels module exports an object that references core ui layers view panel methods.

Custom methods can be added through plugins by assigning a method to the mapp.ui.layers.panels{} object.

@requires /ui/layers/panels/dataviews
@requires /ui/layers/panels/draw
@requires /ui/layers/panels/filter
@requires /ui/layers/panels/gazetteer
@requires /ui/layers/panels/jsonEditor
@requires /ui/layers/panels/meta
@requires /ui/layers/panels/reports
@requires /ui/layers/panels/style

@module /ui/layers/panels
*/

import dataviews from './dataviews.mjs';
import draw from './draw.mjs';
import filter from './filter.mjs';
import gazetteer from './gazetteer.mjs';
import jsonEditor from './jsonEditor.mjs';
import meta from './meta.mjs';
import reports from './reports.mjs';
import style from './style.mjs';

export default {
  dataviews,
  draw,
  filter,
  gazetteer,
  jsonEditor,
  meta,
  reports,
  style,
};
