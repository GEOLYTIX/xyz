import geoJSON from './geoJSON.mjs';

import rectangle from './rectangle.mjs';

import circle from './circle.mjs';

import line from './line.mjs';

import point from './point.mjs';

import catchment from './catchment.mjs';

import isoline from './isoline.mjs';

import polygon from './polygon.mjs';

import finish from './finish.mjs';

export default _xyz => ({

  geoJSON: geoJSON(_xyz),

  rectangle: rectangle(_xyz),

  circle: circle(_xyz),

  line: line(_xyz),

  point: point(_xyz),

  polygon: polygon(_xyz),

  catchment: catchment(_xyz),

  isoline: isoline(_xyz),

  finish: finish(_xyz),

});