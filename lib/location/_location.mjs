/**
## mapp.location{}
The mapp.location module provides methods to get and decorate location objects.

@module /location
*/

import decorate from './decorate.mjs'

import {get, getInfoj} from './get.mjs'

import nnearest from './nnearest.mjs'

export default {
  decorate,
  get,
  getInfoj,
  nnearest,
}