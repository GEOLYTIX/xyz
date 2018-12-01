import _xyz from '../../_xyz.mjs';

import L from 'leaflet';

import 'leaflet.vectorgrid';

export default function(){

  const layer = this;
  layer.loaded = false;

  // Set locale to check whether locale is still current when data is returned from backend.
  const locale = _xyz.locale;

  if (!layer.table || !layer.display) return _xyz.layers.check(layer);

  // Create filter from legend and current filter.
  const filter = Object.assign({}, layer.filter.legend, layer.filter.current);

  let url = _xyz.host + '/api/layer/mvt/{z}/{x}/{y}?' + _xyz.utils.paramString({
      locale: _xyz.locale,
      layer: layer.key,
      table: layer.table,
      properties: layer.properties,
      filter: JSON.stringify(filter),
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

  // Create cat array for graduated theme.
  if (layer.style.theme && layer.style.theme.type === 'graduated') {
    layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  }

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
      }

    })
    .on('mouseover', e => {
      e.target.setFeatureStyle(e.layer.properties.id, layer.style.highlight);
    })
    .on('mouseout', e => {
      e.target.setFeatureStyle(e.layer.properties.id, applyLayerStyle);
    })
    .addTo(_xyz.map);

  function applyLayerStyle(properties, zoom) {

    // Return default style if no theme is set on layer.
    if (!layer.style.theme) return layer.style.default;

    const theme = layer.style.theme;

    // Categorized theme.
    if (theme.type === 'categorized') {

      return Object.assign({}, layer.style.default, theme.cat[properties[theme.field]] || {});

    }

    // Graduated theme.
    if (theme.type === 'graduated') {

      theme.cat_style = {};

      // Iterate through cat array.
      for (let i = 0; i < theme.cat_arr.length; i++) {

        // Break iteration is cat value is below current cat array value.
        if (parseFloat(properties[theme.field]) < parseFloat(theme.cat_arr[i][0])) break;

        // Set cat_style to current cat style after value check.
        theme.cat_style = theme.cat_arr[i][1];

      }

      // Assign style from base & cat_style.
      return Object.assign({}, layer.style.default, theme.cat_style);

    }

  }
}