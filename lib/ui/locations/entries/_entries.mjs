import boolean from './boolean.mjs'

import cloudinary from './cloudinary.mjs'

import dataview from './dataview.mjs'

import date from './date.mjs'

import defaults from './defaults.mjs'

import geometry from './geometry.mjs'

import json from './json.mjs'

import mvt_clone from './mvt_clone.mjs'

import numeric from './numeric.mjs'

import pin from './pin.mjs'

import pills from './pills.mjs'

import link from './link.mjs'

import tab from './tab.mjs'

import text from './text.mjs'

import textarea from './textarea.mjs'

import time from './time.mjs'

import vector_layer from './vector_layer.mjs'

export default {
  boolean,
  dataview,
  date,
  datetime: date,
  defaults,
  documents: cloudinary,
  geometry,
  html: textarea,
  image: cloudinary,
  images: cloudinary,
  integer: numeric,
  json,
  pills,
  key,
  link,
  mvt_clone,
  numeric,
  pin,
  report: link,
  tab,
  text,
  textarea,
  time,
  title,
  vector_layer
}

function key(entry) {

  const node = mapp.utils.html.node`
  <div class="layer-key">
    <span>
      ${entry.location.layer.name}`

  return node
}

function title(entry) {
  
  const tooltipSpan = entry.tooltip && mapp.utils.html`
    <span
      class="tooltip mask-icon question-mark">${entry.tooltip}`

  return mapp.utils.html.node`
    <div
      class="label"
      style=${entry.css_title}
      title=${entry.tooltip}>${entry.title}
      ${tooltipSpan}`;
}
