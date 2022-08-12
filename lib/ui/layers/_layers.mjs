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
  styles: {
    categorized,
    graduated,
    grid,
    basic,
  }
}