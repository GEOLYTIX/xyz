/**
## ui/locations/entries

Exports a collection of entry methods for location views.

- boolean
- dataview
- date
- datetime
- defaults
- documents
- geometry
- html
- image
- images
- integer
- json
- pills
- key
- link
- mvt_clone
- numeric
- pin
- report
- tab
- text
- textarea
- time
- title
- vector_layer
- query_button

@module /ui/locations/entries
*/

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

import key from './key.mjs'

import title from './title.mjs'

import query_button from './query_button.mjs'

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
  vector_layer,
  query_button
}
