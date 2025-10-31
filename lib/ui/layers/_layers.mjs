/**
## /ui/layers

@module /ui/layers
*/

import filters from './filters.mjs';
import legends from './legends/_legends.mjs';
import listview from './listview.mjs';
import dataviews from './panels/dataviews.mjs';
import draw from './panels/draw.mjs';
import filter from './panels/filter.mjs';
import gazetteer from './panels/gazetteer.mjs';
import jsonEditor from './panels/jsonEditor.mjs';
// Panels
import meta from './panels/meta.mjs';
import reports from './panels/reports.mjs';
import style from './panels/style.mjs';
import view from './view.mjs';

export default {
  filters,
  legends: legends,
  listview,
  panels: {
    dataviews,
    draw,
    filter,
    gazetteer,
    jsonEditor,
    meta,
    reports,
    style,
  },
  view,
};
