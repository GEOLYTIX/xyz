import view from './view.mjs'

import listview from './listview.mjs'

import filters from './filters.mjs'

// Panels

import edit from './panels/draw.mjs'

import filter from './panels/filter.mjs'

import gazetteer from './panels/gazetteer.mjs'

import dataviews from './panels/dataviews.mjs'

import reports from './panels/reports.mjs'

import style from './panels/style.mjs'

// Styles

import categorized from './legends/categorized.mjs'

import distributed from './legends/distributed.mjs'

import graduated from './legends/graduated.mjs'

import grid from './legends/grid.mjs'

import basic from './legends/basic.mjs'

export default {
  view,
  listview,
  filters,
  panels: {
    edit,
    style,
    filter,
    gazetteer,
    reports,
    dataviews
  },
  legends: {
    categorized,
    distributed,
    graduated,
    grid,
    basic,
  },
  styles: {
    categorized: layer => {console.warn('Please use mapp.layers.legends instead of mapp.layers.styles'); return categorized(layer)},
    graduated: layer => {console.warn('Please use mapp.layers.legends instead of mapp.layers.styles'); return graduated(layer)},
    grid: layer => {console.warn('Please use mapp.layers.legends instead of mapp.layers.styles'); return grid(layer)},
    basic: layer => {console.warn('Please use mapp.layers.legends instead of mapp.layers.styles'); return basic(layer)},
  }
}