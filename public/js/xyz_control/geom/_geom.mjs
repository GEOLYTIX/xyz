import geoJSON from './geoJSON.mjs';

import rectangle from './rectangle.mjs';

import circle from './circle.mjs';

import line from './line.mjs';

import point from './point.mjs';

import isoline_mapbox from './isoline_mapbox.mjs';

import isoline_here from './isoline_here.mjs';

import isoline_here_control from './isoline_here_control.mjs';

import polygon from './polygon.mjs';

import finish from './finish.mjs';

export default _xyz => ({

  geoJSON: geoJSON(_xyz),

  rectangle: rectangle(_xyz),

  circle: circle(_xyz),

  line: line(_xyz),

  point: point(_xyz),

  polygon: polygon(_xyz),

  isoline_mapbox: isoline_mapbox(_xyz),

  isoline_here: isoline_here(_xyz),

  isoline_here_control: isoline_here_control(_xyz),

  finish: finish(_xyz),

});