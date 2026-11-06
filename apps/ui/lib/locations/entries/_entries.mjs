/**
## ui/locations/entries

Exports a collection of entry methods for location views.

@requires /ui/locations/entries/boolean
@requires /ui/locations/entries/cloudinary
@requires /ui/locations/entries/dataview
@requires /ui/locations/entries/date
@requires /ui/locations/entries/geometry
@requires /ui/locations/entries/json
@requires /ui/locations/entries/key
@requires /ui/locations/entries/layer
@requires /ui/locations/entries/link
@requires /ui/locations/entries/numeric
@requires /ui/locations/entries/pills
@requires /ui/locations/entries/pin
@requires /ui/locations/entries/ping
@requires /ui/locations/entries/query_button
@requires /ui/locations/entries/tab
@requires /ui/locations/entries/text
@requires /ui/locations/entries/textarea
@requires /ui/locations/entries/time
@requires /ui/locations/entries/title

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

import boolean from './boolean.mjs';

import cloudinary from './cloudinary.mjs';

import dataview from './dataview.mjs';

import date from './date.mjs';

import geometry from './geometry.mjs';

import json from './json.mjs';

import key from './key.mjs';

import layer from './layer.mjs';

import link from './link.mjs';

import numeric from './numeric.mjs';

import pills from './pills.mjs';

import pin from './pin.mjs';

import ping from './ping.mjs';

import query_button from './query_button.mjs';

import tab from './tab.mjs';

import text from './text.mjs';

import textarea from './textarea.mjs';

import time from './time.mjs';

import title from './title.mjs';

/**
@function defaults
@deprecated

@description
The deprectaed defaults entry method was setting the and updating the mapp user to the entry field.

This method has been deprecated in favour of a more general plugin to set and update the user email and datetime.
*/

function defaults() {
  console.warn(`The type:defaults entry method has been deprecated.`);
}

/**
@function legacy_layer

@description
The legacy_layer method maps the layer entry method to the deprecated vector_layer and mvt_clone methods.

The type:'layer' will be assigned, overwriting the 'mvt_clone' and 'vector_layer' types.

`id` will be assigned as default for qID which is required for vector format layers.

The name is assigned from the label property.
@param {infoj-entry} entry mvt_clone type entry. 

@return {Function} layer entry method.
*/
function legacy_layer(entry) {
  console.warn(
    `The type:${entry.type} entry method has been deprecated in favour of the type:layer entry method.`,
  );

  entry.type = 'layer';

  entry.qID ??= 'id';

  entry.name ??= entry.label;

  return layer(entry);
}

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
  key,
  layer,
  link,
  mvt_clone: legacy_layer,
  numeric,
  pills,
  pin,
  ping,
  query_button,
  report: link,
  tab,
  text,
  textarea,
  time,
  title,
  vector_layer: legacy_layer,
};
