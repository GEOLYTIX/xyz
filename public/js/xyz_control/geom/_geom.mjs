import rectangle from './rectangle.mjs';

import circle from './circle.mjs';

import line from './line.mjs';

import point from './point.mjs';

import point_edit from './point_edit.mjs';

import isoline_mapbox from './isoline_mapbox.mjs';

import isoline_mapbox_control from './isoline_mapbox_control.mjs';

import isoline_here from './isoline_here.mjs';

import isoline_here_control from './isoline_here_control.mjs';

import polygon from './polygon.mjs';

import polygon_edit from './polygon_edit.mjs';

import finish from './finish.mjs';

import contextmenu from './contextmenu.mjs';

export default _xyz => ({

  rectangle: rectangle(_xyz),

  circle: circle(_xyz),

  line: line(_xyz),

  point: point(_xyz),

  point_edit: point_edit(_xyz),

  polygon: polygon(_xyz),

  polygon_edit: polygon_edit(_xyz),

  isoline_mapbox: isoline_mapbox(_xyz),

  isoline_mapbox_control: isoline_mapbox_control(_xyz),

  isoline_here: isoline_here(_xyz),

  isoline_here_control: isoline_here_control(_xyz),

  finish: finish(_xyz),

  contextmenu: contextmenu(_xyz)
});