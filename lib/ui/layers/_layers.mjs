/**
## /ui/layers

@module /ui/layers
*/

import filters from './filters.mjs';
import basic from './legends/basic.mjs';
// Styles
import categorized from './legends/categorized.mjs';
import graduated from './legends/graduated.mjs';
import listview from './listview.mjs';
import dataviews from './panels/dataviews.mjs';
import draw from './panels/draw.mjs';
import filter from './panels/filter.mjs';
import gazetteer from './panels/gazetteer.mjs';
// Panels
import meta from './panels/meta.mjs';
import reports from './panels/reports.mjs';
import style from './panels/style.mjs';
import view from './view.mjs';
import json_editor from './panels/json_editor.mjs';

export default {
  filters,
  legends: {
    basic,
    categorized,
    graduated,
  },
  listview,
  panels: {
    dataviews,
    draw,
    filter,
    gazetteer,
    meta,
    reports,
    style,
    json_editor,
  },
  styles: {
    basic: (layer) => {
      console.warn(
        'Please use mapp.layers.legends instead of mapp.layers.styles',
      );
      return basic(layer);
    },
    categorized: (layer) => {
      console.warn(
        'Please use mapp.layers.legends instead of mapp.layers.styles',
      );
      return categorized(layer);
    },
    graduated: (layer) => {
      console.warn(
        'Please use mapp.layers.legends instead of mapp.layers.styles',
      );
      return graduated(layer);
    },
    grid: (layer) => {
      console.warn(
        'Please use mapp.layers.legends instead of mapp.layers.styles',
      );
      return grid(layer);
    },
  },
  view,
};
