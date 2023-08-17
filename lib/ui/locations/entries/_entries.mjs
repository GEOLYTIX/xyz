import boolean from './boolean.mjs'

import dataview from './dataview.mjs'

import date from './date.mjs'

import defaults from './defaults.mjs'

import documents from './documents.mjs'

import geometry from './geometry.mjs'

import images from './images.mjs'

import json from './json.mjs'

import mvt_clone from './mvt_clone.mjs'

import numeric from './numeric.mjs'

import pin from './pin.mjs'

import report from './report.mjs'

import tab from './tab.mjs'

import text from './text.mjs'

import textarea from './textarea.mjs'

import time from './time.mjs'

export default {
  key,
  boolean,
  dataview,
  date,
  datetime: date,
  defaults,
  documents,
  geometry,
  html: textarea,
  images,
  integer: numeric,
  json,
  mvt_clone,
  numeric,
  pin,
  report,
  tab,
  text,
  textarea,
  time,
}

function key(entry) {

  const node = mapp.utils.html.node`
  <div class="layer-key">
    <span>
      ${entry.location.layer.name}`

  return node
}