import _xyz from '../../../_xyz.mjs';

import format_mvt from './format/mvt.mjs';

import format_geojson from './format/geojson.mjs';

import format_cluster from './format/cluster.mjs';

import format_tiles from './format/tiles.mjs';

import format_grid from './format/grid.mjs';

_xyz.layers.add = layer => {

  layer.tableCurrent = function(){

    const layer = this;

    if (!layer.tables) return layer.table;

    let
      table,
      zoom = _xyz.map.getZoom(),
      zoomKeys = Object.keys(layer.tables),
      minZoomKey = parseInt(zoomKeys[0]),
      maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);
            
    table = layer.tables[zoom];

    table = zoom < minZoomKey ? layer.tables[minZoomKey] : table;

    table = zoom > maxZoomKey ? layer.tables[maxZoomKey] : table;

    if (layer.drawer) layer.drawer.style.opacity = !table ? 0.4 : 1;

    if (layer.loader) layer.loader.style.display = (!table || !layer.display) ? 'none' : 'block';

    if (!table && layer.attribution) _xyz.attribution.remove(layer.attribution);

    return table;

  };

  layer.tableMin = function(){

    const layer = this;

    if (!layer.tables) return layer.table;

    let zoomKeys = Object.keys(layer.tables);

    return layer.tables[zoomKeys[0]] || layer.tables[zoomKeys[1]];

  };

  layer.tableMax = function(){

    const layer = this;

    if (!layer.tables) return layer.table;

    let zoomKeys = Object.keys(layer.tables);

    return layer.tables[zoomKeys[zoomKeys.length-1]] || layer.tables[zoomKeys[zoomKeys.length-2]];

  };

  if (!layer.format) return;

  if (!layer.key) return;

  _xyz.panes.list.push(_xyz.map.createPane(layer.key));
  _xyz.map.getPane(layer.key).style.zIndex = _xyz.panes.next++;
    
  if (layer.format === 'mvt') layer.get = format_mvt;

  if (layer.format === 'geojson') layer.get = format_geojson;

  if (layer.format === 'cluster') layer.get = format_cluster;

  if (layer.format === 'tiles') layer.get = format_tiles;

  if (layer.format === 'grid') layer.get = format_grid;

  layer.loaded = false;
  layer.get();

};