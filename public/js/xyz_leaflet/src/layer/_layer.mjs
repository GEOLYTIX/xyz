import MVT from './format/mvt.mjs';

import Geojson from './format/geojson.mjs';

import PolyGraduatedLegend from './legend/polyGraduated.mjs';

import Cluster from './format/cluster.mjs';

import ClusterCategorizedLegend from './legend/clusterCategorized.mjs';

import Tiles from './format/tiles.mjs';

import Grid from './format/grid.mjs';

import GridLegend from './legend/grid.mjs';

export default _xyz => {

  const format_mvt = MVT(_xyz);

  const format_geojson = Geojson(_xyz);

  const legend_polyGraduated = PolyGraduatedLegend(_xyz);

  const format_cluster = Cluster(_xyz);

  const legend_clusterCategorized = ClusterCategorizedLegend(_xyz);

  const format_tiles = Tiles(_xyz);

  const format_grid = Grid(_xyz);

  const legend_grid = GridLegend(_xyz);

  _xyz.layers.add = layer => {

    layer.tableCurrent = () => {

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

    layer.tableMin = () => {

      if (!layer.tables) return layer.table;

      let zoomKeys = Object.keys(layer.tables);

      return layer.tables[zoomKeys[0]] || layer.tables[zoomKeys[1]];

    };

    layer.tableMax = () => {

      if (!layer.tables) return layer.table;

      let zoomKeys = Object.keys(layer.tables);

      return layer.tables[zoomKeys[zoomKeys.length-1]] || layer.tables[zoomKeys[zoomKeys.length-2]];

    };

    layer.show = () => {
      layer.display = true;
      layer.loaded = false;
      layer.get();
    };

    layer.remove = () => {
      layer.display = false;
      layer.loaded = false;
      if (layer.L) _xyz.map.removeLayer(layer.L);
      if (layer.attribution) _xyz.attribution.remove(layer.attribution);
    };

    if (!layer.format) return;

    if (!layer.key) return;

    // Create empty legend container.
    if (layer.style) layer.style.legend = _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'legend'
      }
    });

    _xyz.panes.list.push(_xyz.map.createPane(layer.key));
    _xyz.map.getPane(layer.key).style.zIndex = _xyz.panes.next++;
    
    if (layer.format === 'mvt') {
      layer.get = format_mvt;
      layer.getLegend = legend_polyGraduated;
    }

    if (layer.format === 'geojson') layer.get = format_geojson;

    if (layer.format === 'cluster') {
      layer.get = format_cluster;
      layer.getLegend = legend_clusterCategorized;
    }

    if (layer.format === 'tiles') layer.get = format_tiles;

    if (layer.format === 'grid') {
      layer.get = format_grid;
      layer.getLegend = legend_grid;
    }

    layer.loaded = false;
    layer.get();

  };

};