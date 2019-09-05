import point_edit from './point_edit.mjs';

import isoline_mapbox from './isoline_mapbox.mjs';

import isoline_mapbox_control from './isoline_mapbox_control.mjs';

import isoline_here from './isoline_here.mjs';

import isoline_here_control from './isoline_here_control.mjs';

import polygon_edit from './polygon_edit.mjs';

import finish from './finish.mjs';

import contextmenu from './contextmenu.mjs';

export default _xyz => ({

  point_edit: point_edit(_xyz),

  polygon_edit: polygon_edit(_xyz),

  isoline_mapbox: isoline_mapbox(_xyz),

  isoline_mapbox_control: isoline_mapbox_control(_xyz),

  isoline_here: isoline_here(_xyz),

  isoline_here_control: isoline_here_control(_xyz),

  finish: finish(_xyz),

  contextmenu: contextmenu(_xyz)
});