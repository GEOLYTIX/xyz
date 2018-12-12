import _xyz from '../../../_xyz.mjs';

import format_mvt from './format/mvt.mjs';

import format_geojson from './format/geojson.mjs';

import format_cluster from './format/cluster.mjs';

import format_tiles from './format/tiles.mjs';

import format_grid from './format/grid.mjs';

_xyz.layers.add = layer => {

  /*
_xyz.layers.getTable = layer => {

  let
    zoom = _xyz.map.getZoom(),
    zoomKeys = Object.keys(layer.tables),
    maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);
            
  layer.table = zoom > maxZoomKey ?
    layer.tables[maxZoomKey] : zoom < zoomKeys[0] ?
      null : layer.tables[zoom];

  // Make drawer opaque if no table present.
  layer.drawer.style.opacity = !layer.table ? 0.4 : 1;
};
*/

  if (!layer.format) return;

  if (!layer.key) return;

  _xyz.panes.list.push(_xyz.map.createPane(layer.key));
  _xyz.map.getPane(layer.key).style.zIndex = _xyz.panes.next++;
    
  if (layer.format === 'mvt') layer.get = format_mvt;

  if (layer.format === 'geojson') layer.get = format_geojson;

  if (layer.format === 'cluster') layer.get = format_cluster;

  if (layer.format === 'tiles') layer.get = format_tiles;

  if (layer.format === 'grid') layer.get = format_grid;

  layer.get();

};