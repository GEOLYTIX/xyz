export default _xyz => layer => () => {

  layer.highlight = true;

  if (!layer.select) layer.select = select;

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

  const url = _xyz.host + '/api/layer/mvt/{z}/{x}/{y}?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    table: layer.table,
    properties: layer.properties,
    filter: JSON.stringify(filter),
    token: _xyz.token
  });

  // Create cat array for graduated theme.
  if (layer.style.theme && layer.style.theme.type === 'graduated') {
    layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  }

  // Remove layer.
  //if (layer.L) _xyz.map.removeLayer(layer.L);

  if (layer.L && layer.loaded) return;

  layer.loaded = true;

  const source = new _xyz.mapview.lib.ol.source.VectorTile({
    format: new _xyz.mapview.lib.ol.format.MVT({
      //featureClass: _xyz.mapview.lib.ol.Feature
    }),
    transition: 0,
    url: url
  });

  layer.tilesLoaded = 0;

  source.on('tileloadstart', () => {
    layer.tilesLoaded++;
    if (layer.view.loader) layer.view.loader.style.display = 'block';
  });

  source.on('tileloadend', () => {
    layer.tilesLoaded--;
    if (layer.view.loader && layer.tilesLoaded === 0) layer.view.loader.style.display = 'none';
  });

  layer.L = new _xyz.mapview.lib.ol.layer.VectorTile({
    source: source,
    zIndex: layer.style.zIndex || 1,
    style: feature => {
      const style = applyLayerStyle(feature);

      return new _xyz.mapview.lib.ol.style.Style({
        stroke: new _xyz.mapview.lib.ol.style.Stroke({
          color: style.color,
          width: style.weight
        }),
        fill: new _xyz.mapview.lib.ol.style.Fill({
          color: _xyz.utils.hexToRGBA(style.fillColor, style.fillOpacity || 1, true)
        }),
        zIndex: style.zIndex,
      // image: _xyz.mapview.lib.icon(params.style.icon),
      // image: new _xyz.mapview.lib.ol.style.Circle({
      //   radius: 7,
      //   fill: new _xyz.mapview.lib.ol.style.Fill({
      //     color: 'rgba(0, 0, 0, 0.01)'
      //   }),
      //   stroke: new _xyz.mapview.lib.ol.style.Stroke({
      //     color: '#EE266D',
      //     width: 2
      //   })
      // })
      });
    }
  });

  _xyz.map.addLayer(layer.L);

  layer.L.set('layer',layer,true);


  // if (layer.style.label && layer.style.label.display) {

  //   if (layer.label) _xyz.map.removeLayer(layer.label);

  //   layer.label = new _xyz.mapview.lib.ol.layer.VectorTile({
  //     source: new _xyz.mapview.lib.ol.source.VectorTile({
  //       format: new _xyz.mapview.lib.ol.format.MVT({
  //         //featureClass: _xyz.mapview.lib.ol.Feature
  //       }),
  //       transition: 0,
  //       url: url
  //     }),
  //     style: feature => {

  //       const label = feature.get(layer.style.label.field);
       
  //       return new _xyz.mapview.lib.ol.style.Style({
          
  //         text: new _xyz.mapview.lib.ol.style.Text({
  //           text: label,
  //           size: '12px',
  //           stroke: new _xyz.mapview.lib.ol.style.Stroke({
  //             color: '#fff',
  //             width: 3
  //           }),
  //         })
  //       });

  //     }
  //   });

  //   _xyz.map.addLayer(layer.label);

  // }


  function applyLayerStyle(properties) {

    const highlighted = layer.highlight === properties.get('id');
    
    //layer.highlighted === properties.get('id');
    //const selected = layer.selected.has(properties.get('id'));

    //if (highlighted) console.log(layer.highlight);



    let style = Object.assign(
      {},
      layer.style.default,
      highlighted ? layer.style.highlight : {},
    );

    style.zIndex = (highlighted ? 30 : 10);

    // let style = Object.assign({}, layer.style.default);

    // Return default style if no theme is set on layer.
    if (!layer.style.theme) return style;

    const theme = layer.style.theme;

    // Categorized theme.
    if (theme.type === 'categorized') {

      return Object.assign(
        {},
        style,
        theme.cat[properties.get(theme.field)] || {},
        highlighted ? layer.style.highlight : {},
      );

    }

    // Graduated theme.
    if (theme.type === 'graduated') {

      theme.cat_arr = Object.entries(layer.style.theme.cat).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  

      theme.cat_style = {};

      // Iterate through cat array.
      for (let i = 0; i < theme.cat_arr.length; i++) {

        if (!properties.get(theme.field)) return style;

        // Break iteration is cat value is below current cat array value.
        if (parseFloat(properties.get(theme.field)) < parseFloat(theme.cat_arr[i][0])) break;

        // Set cat_style to current cat style after value check.
        theme.cat_style = theme.cat_arr[i][1];

      }

      // Assign style from base & cat_style.
      return Object.assign(
        {},
        style,
        theme.cat_style,
        highlighted ? layer.style.highlight : {},
      );

    }

  }

  function select(e, feature){

    _xyz.locations.select({
      locale: _xyz.workspace.locale.key,
      layer: layer.key,
      table: layer.table,
      id: feature.get('id'),
      marker: _xyz.mapview.lib.ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326'),
      edit: layer.edit
    });

  }

};