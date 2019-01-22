export default (_xyz, layer) => () => {

  // Get table for the current zoom level.
  const table = layer.tableCurrent();

  // Return if layer should not be displayed.
  if (!layer.display) return;

  if (!table) {

    // Remove existing layer from map.
    if (layer.L) _xyz.map.removeLayer(layer.L);  

    return layer.loaded = false;
  }

  // Return from layer.get() if table is the same as layer table
  // AND the layer is already loaded.
  if (layer.table === table && layer.loaded) return;

  // Set table to layer.table.
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
  });

  let options = {
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

  // Remove layer.
  if (layer.L) _xyz.map.removeLayer(layer.L);

  layer.L = L.vectorGrid.protobuf(url, options)
    .on('error', err => console.error(err))
    .on('loading', () => {
      
      if (layer.loader) layer.loader.style.display = 'block';

    })
    .on('load', () => {
     
      if (layer.loader)  layer.loader.style.display = 'none';

      if (layer.attribution) _xyz.attribution.set(layer.attribution);

      layer.loaded = true;

    })
    .on('click', e => {

      if (layer.singleSelectOnly) {

        layer.selected = [e.layer.properties.id];

        layer.L.redraw();

      } else {

        let selectedIdx = layer.selected.indexOf(e.layer.properties.id);
        
        selectedIdx >= 0 ?
          layer.selected.splice(selectedIdx, 1) :
          layer.selected.push(e.layer.properties.id);

      }

      e.target.setFeatureStyle(e.layer.properties.id, applyLayerStyle);

      _xyz.locations.select({
        dbs: layer.dbs,
        locale: layer.locale,
        layer: layer.key,
        table: layer.table,
        qID: layer.qID,
        id: e.layer.properties.id,
        marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)],
        edit: layer.edit
      });

    })
    .on('mouseover', e => {
      e.target.setFeatureStyle(e.layer.properties.id, layer.style.highlight);
    })
    .on('mouseout', e => {
      e.target.setFeatureStyle(e.layer.properties.id, applyLayerStyle);
    })
    .addTo(_xyz.map);

  function applyLayerStyle(properties) {

    let style = Object.assign({}, layer.style.default, layer.selected.includes(properties.id) ? layer.style.selected : {});

    // Return default style if no theme is set on layer.
    if (!layer.style.theme) return style;

    const theme = layer.style.theme;

    // Categorized theme.
    if (theme.type === 'categorized') {

      return Object.assign({}, style, theme.cat[properties[theme.field]] || {});

    }

    // Graduated theme.
    if (theme.type === 'graduated') {

      theme.cat_style = {};

      // Iterate through cat array.
      for (let i = 0; i < theme.cat_arr.length; i++) {

        if (!properties[theme.field]) return style;

        // Break iteration is cat value is below current cat array value.
        if (parseFloat(properties[theme.field]) < parseFloat(theme.cat_arr[i][0])) break;

        // Set cat_style to current cat style after value check.
        theme.cat_style = theme.cat_arr[i][1];

      }

      // Assign style from base & cat_style.
      return Object.assign({}, style, theme.cat_style);

    }

  }

};