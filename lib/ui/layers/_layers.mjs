import view from './view.mjs'

import listview from './listview.mjs'

import filters from './filters.mjs'

// Panels

import edit from './panels/draw.mjs'

import filter from './panels/filter.mjs'

import dataviews from './panels/dataviews.mjs'

import reports from './panels/reports.mjs'

import style from './panels/style.mjs'

// Styles

import categorized from './styles/categorized.mjs'

import graduated from './styles/graduated.mjs'

import grid from './styles/grid.mjs'

import basic from './styles/basic.mjs'

export default {
  view,
  listview,
  filters,
  panels: {
    edit,
    style,
    filter,
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