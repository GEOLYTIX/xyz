/**
## /ui/locations/entries/defaults

The defaults location entry module exports the deprecated defaults entry method.

@module /ui/locations/entries/defaults
*/

/**
@function defaults
@deprecated

@description
The deprectaed defaults entry method was setting the and updating the mapp user to the entry field.

This method has been deprecated in favour of a more general plugin to set and update the user email and datetime.
*/

export default function defaults() {

  console.warn(`The type:defaults entry method has been deprecated.`)
}