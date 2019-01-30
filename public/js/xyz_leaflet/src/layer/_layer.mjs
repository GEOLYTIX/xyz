import format_mvt from './format/mvt.mjs';

import format_geojson from './format/geojson.mjs';

import legend_polyCategorized from './legend/polyCategorized.mjs';

import legend_polyGraduated from './legend/polyGraduated.mjs';

import format_cluster from './format/cluster.mjs';

import legend_clusterCategorized from './legend/clusterCategorized.mjs';

import legend_clusterGraduated from './legend/clusterGraduated.mjs';

import format_tiles from './format/tiles.mjs';

import format_grid from './format/grid.mjs';

import legend_grid from './legend/grid.mjs';

export default _xyz => {

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

    layer.selected = [];

    // Create empty legend container.
    if (layer.style) {
      layer.style.legend = _xyz.utils.createElement({
        tag: 'div',
        options: {
          classList: 'legend'
        }
      });

      layer.style.setLegend = dom => {
        layer.style.getLegend();
        dom.appendChild(layer.style.legend);
      };

      layer.style.getLegend = () => {

        if (layer.format === 'mvt' && layer.style.theme.type === 'categorized') legend_polyCategorized(_xyz, layer);

        if (layer.format === 'mvt' && layer.style.theme.type === 'graduated') legend_polyGraduated(_xyz, layer);

        if (layer.format === 'cluster' && layer.style.theme.type === 'categorized') legend_clusterCategorized(_xyz, layer);

        if (layer.format === 'cluster' && layer.style.theme.type === 'competition') legend_clusterCategorized(_xyz, layer);

        if (layer.format === 'cluster' && layer.style.theme.type === 'graduated') legend_clusterGraduated(_xyz, layer);

        if (layer.format === 'grid') legend_grid(_xyz, layer);

      };

      if (layer.style.themes) layer.style.theme = layer.style.themes[Object.keys(layer.style.themes)[0]];

      if (layer.style.themes) layer.style.setTheme = theme => {
        layer.style.theme = layer.style.themes[theme];
        layer.show();
      };

    }

    _xyz.panes.list.push(_xyz.map.createPane(layer.key));
    _xyz.map.getPane(layer.key).style.zIndex = _xyz.panes.next++;
    
    if (layer.format === 'mvt') layer.get = format_mvt(_xyz, layer);

    if (layer.format === 'geojson') layer.get = format_geojson(_xyz, layer);

    if (layer.format === 'cluster') layer.get = format_cluster(_xyz, layer);

    if (layer.format === 'tiles') layer.get = format_tiles(_xyz, layer);

    if (layer.format === 'grid') layer.get = format_grid(_xyz, layer);

    layer.loaded = false;
    layer.get();

  };

  _xyz.layers.geoJSON = params => {

    if (!params.json) return;

    if (!params.icon) return _xyz.L.geoJson(params.json, {
      interactive: params.interactive || false,
      pane: params.pane || 'default',
      style: params.style || {},
      pointToLayer: () => {}
    }).addTo(_xyz.map);

    return _xyz.L.geoJson(params.json, {
      interactive: params.interactive || false,
      pane: params.pane || 'default',
      pointToLayer: (feature, latlng) => new _xyz.L.Marker(latlng, {
        interactive: params.interactive || false,
        pane: params.pane || 'default',
        icon: _xyz.L.icon({
          iconUrl: params.icon.url,
          iconSize: params.icon.size || 40,
          iconAnchor: params.icon.anchor || [20, 40]
        })
      }),
      style: params.style || {}
    }).addTo(_xyz.map);

  };

};