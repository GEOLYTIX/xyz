import _xyz from '../../_xyz.mjs';

import L from 'leaflet';

import 'leaflet.vectorgrid';

export default function(){

  const layer = this;
  layer.loaded = false;

  // Set locale to check whether locale is still current when data is returned from backend.
  const locale = _xyz.locale;

  // Assign the table based on the zoom array.
  let zoom = _xyz.map.getZoom(),
    zoomKeys = Object.keys(layer.tables),
    maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);

  layer.table = zoom > maxZoomKey ?
    layer.tables[maxZoomKey] : zoom < zoomKeys[0] ?
      null : layer.tables[zoom];

  // Make drawer opaque if no table present.
  layer.drawer.style.opacity = !layer.table ? 0.4 : 1;

  if (!layer.table || !layer.display) return _xyz.layers.check(layer);

  let url = _xyz.host + '/api/mvt/get/{z}/{x}/{y}?' + _xyz.utils.paramString({
      locale: _xyz.locale,
      layer: layer.key,
      table: layer.table,
      properties: layer.properties,
      token: _xyz.token
    }),
    options = {
      rendererFactory: L.svg.tile,
      interactive: (layer.infoj && layer.qID) || false,
      pane: layer.key,
      getFeatureId: (f) => f.properties.id,
      vectorTileLayerStyles: {}
    };

  // set style for each layer
  options.vectorTileLayerStyles[layer.key] = applyLayerStyle;

  if (layer.L) _xyz.map.removeLayer(layer.L);

  layer.L = L.vectorGrid.protobuf(url, options)
    .on('error', err => console.error(err))
    .on('load', () => {
      //e.target.setFeatureStyle(e.layer.properties.id, applyLayerStyle);
      if (locale === _xyz.locale) _xyz.layers.check(layer);
    })
    .on('click', e => {
      if (e.layer.properties.selected) return;

      e.layer.properties.selected = true;

      function checkCurrentSelection(e) {
        let check = false;
        if (_xyz.hooks.current.select) {
          _xyz.hooks.current.select.map(item => {
            item = item.split('!');
            if (item[1] === layer.key && item[2] === layer.table && item[3] === String(e.layer.properties.id)) {
              check = true;
            }
          });
        }
        return check;
      }

      if (!checkCurrentSelection(e)) {
        // set cursor to wait
        let els = _xyz.map.getContainer().querySelectorAll('.leaflet-interactive');

        for (let el of els) {
          el.classList += ' wait-cursor-enabled';
        }
        // get selection
        _xyz.locations.select({
          layer: layer.key,
          table: layer.table,
          id: e.layer.properties.id,
          marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
        });
        e.layer.properties.selected = false;
      } else {
        //console.log('feature ' + e.layer.properties.id + ' already selected');
      }

    })
    .on('mouseover', e => {
      e.target.setFeatureStyle(e.layer.properties.id, layer.style.highlight || { 'color': '#090' });
    })
    .on('mouseout', e => {
      e.target.setFeatureStyle(e.layer.properties.id, applyLayerStyle);
    })
    .addTo(_xyz.map);

  function applyLayerStyle(properties, zoom) {

    if (layer.style && layer.style.theme && layer.style.theme.type === 'categorized' && layer.style.theme.cat[properties[layer.style.theme.field]]) {

      return layer.style.theme.cat[properties[layer.style.theme.field]].style;

    }

    if (layer.style && layer.style.theme && layer.style.theme.type === 'graduated') {

      let style = layer.style.theme.cat[0].style;

      for (let i = 0; i < layer.style.theme.cat.length; i++) {
        if (properties[layer.style.theme.field] < layer.style.theme.cat[i].val) return layer.style.theme.cat[i].style;
      }

      return style;

    }

    return layer.style.default;
  }
}