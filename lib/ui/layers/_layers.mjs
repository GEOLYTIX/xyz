/**
## /ui/layers

@module /ui/layers
*/

import view from './view.mjs';

import listview from './listview.mjs';

import filters from './filters.mjs';

// Panels
import meta from './panels/meta.mjs';

import draw from './panels/draw.mjs';

import filter from './panels/filter.mjs';

import gazetteer from './panels/gazetteer.mjs';

import dataviews from './panels/dataviews.mjs';

import reports from './panels/reports.mjs';

import style from './panels/style.mjs';

// Styles
import categorized from './legends/categorized.mjs';

import graduated from './legends/graduated.mjs';

import basic from './legends/basic.mjs';

export default {
  view,
  listview,
  filters,
  panels: {
    meta,
    draw,
    style,
    filter,
    gazetteer,
    reports,
    dataviews,
  },
  legends: {
    categorized,
    graduated,
    basic,
  },
  styles: {
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
    basic: (layer) => {
      console.warn(
        'Please use mapp.layers.legends instead of mapp.layers.styles',
      );
      return basic(layer);
    },
  },
};
