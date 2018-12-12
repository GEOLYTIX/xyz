import _xyz from '../../../../_xyz.mjs';

import 'leaflet.vectorgrid';

export default function() {

  const layer = this;

  if (!layer.display) return;

  const table = layer.tableCurrent();

  if (!table) {

    // Remove layer from map if currently drawn.
    if (layer.L) _xyz.map.removeLayer(layer.L);

    layer.loaded = false;

    return;

  }

  // Return from layer.get() if table is the same as layer table.
  if (layer.table === table && layer.loaded) return;

  // Set layer table to be table from tables array.
  layer.table = table;

  // Create filter from legend and current filter.
  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

  let url = _xyz.host + '/api/layer/mvt/{z}/{x}/{y}?' + _xyz.utils.paramString({
      locale: layer.locale,
      layer: layer.key,
      table: layer.table,
      properties: layer.properties,
      filter: JSON.stringify(filter),
      token: _xyz.token
    }),
    options = {
      rendererFactory: _xyz.L.svg.tile,
      interactive: (layer.qID) || false,
      pane: layer.key,
      getFeatureId: f => f.properties.id,
      vectorTileLayerStyles: {}
    };

  // set style for each layer
  options.vectorTileLayerStyles[layer.key] = applyLayerStyle;

  // Create cat array for graduated theme.
  if (layer.style.theme && layer.style.theme.type === 'graduated') {
    layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  }

  if (layer.attribution) _xyz.attribution.set(layer.attribution);

  // Remove layer.
  if (layer.L) _xyz.map.removeLayer(layer.L);

  layer.L = L.vectorGrid.protobuf(url, options)
    .on('error', err => console.error(err))
    .on('load', () => {
      
      layer.loaded = true;

    })
    .on('click', e => {

      // // set cursor to wait
      // let els = _xyz.map.getContainer().querySelectorAll('.leaflet-interactive');

      // for (let el of els) {
      //   el.classList += ' wait-cursor-enabled';
      // }

      if (_xyz.locations.select) return _xyz.locations.select({
        layer: layer.key,
        table: layer.table,
        id: e.layer.properties.id,
        marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
      });

      const xhr = new XMLHttpRequest();

      xhr.open('GET', _xyz.host + '/api/location/select/id?' + _xyz.utils.paramString({
        locale: layer.locale,
        layer: layer.key,
        table: layer.table,
        id: e.layer.properties.id,
        token: _xyz.token
      }));

      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.responseType = 'json';
    
      xhr.onload = e => {
    
        // // remove wait cursor class if found
        // let els = _xyz.map.getContainer().querySelectorAll('.leaflet-interactive.wait-cursor-enabled');
        // for (let el of els) {
        //   el.classList.remove('wait-cursor-enabled');
        // }
    
        if (e.target.status !== 200) return;
    
        alert(JSON.stringify(e.target.response));
          
      };
    
      xhr.send();

    })
    .on('mouseover', e => {
      e.target.setFeatureStyle(e.layer.properties.id, layer.style.highlight);
    })
    .on('mouseout', e => {
      e.target.setFeatureStyle(e.layer.properties.id, applyLayerStyle);
    })
    .addTo(_xyz.map);

  function applyLayerStyle(properties) {

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