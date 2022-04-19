import boolean from './boolean.mjs'

import dataview from './dataview.mjs'

import date from './date.mjs'

import documents from './documents.mjs'

import geometry from './geometry.mjs'

import images from './images.mjs'

import isoline from './isoline.mjs'

import json from './json.mjs'

import numeric from './numeric.mjs'

import pin from './pin.mjs'

import report from './report.mjs'

import streetview from './streetview.mjs'

import tab from './tab.mjs'

import text from './text.mjs'

import textarea from './textarea.mjs'

export default {
  key,
  boolean,
  dataview,
  date,
  datetime: date,
  documents,
  geometry,
  html: textarea,
  images,
  integer: numeric,
  isoline_here: isoline,
  isoline_mapbox: isoline,
  json,
  numeric,
  pin,
  report,
  streetview,
  tab,
  text,
  textarea,
}

function key(entry) {

  const node = mapp.utils.html.node`
  <div class="layer-key">
    <span>
      ${entry.location.layer.name}`

  return node
}