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

/**
@global
@typedef {Object} infoj-entry
A infoj-entry describes a location property. Locations are configured as an array of JSON Object entries layer.infoj[].
@property {string} key A unique identifier for the entry. Will be assigned from iteration index in infoj location method if not implicit.
@property {location} location The entry location.
@property {*} [value] The entry value.
@property {string} [field] The database field in layer table which holds the entry data.
@property {string} [fieldfx] A SQL statement to query the entry value in the location get request.
@property {string} [title] The title to be displayed with the entry.value.
@property {boolean} [inline] Flag whether the value should be displayed inline with the title.
@property {object} [edit] Edit configuration for the entry.
@property {string} [query] Query template.
@property {Object} [queryparams] Parameter for query in template.
@property {string} [label] Label for checkbox element.
@property {boolean} [display] Entry display flag.
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
