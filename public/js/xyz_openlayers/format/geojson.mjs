export default _xyz => layer => () => {

  if (!layer.select) layer.select = _select;

  if (layer.hover) {
    if (!layer.hover.show) layer.hover.show = _hover;
  }

  // Return if layer should not be displayed.
  if (!layer.display) return;

  if (layer.loaded) return;

  layer.xhr = new XMLHttpRequest();   
  
  // Create filter from legend and current filter.
  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);
      
  layer.xhr.open('GET', _xyz.host + '/api/layer/geojson?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    table: layer.table,
    cat: layer.style.theme && layer.style.theme.field,
    filter: JSON.stringify(filter),
    token: _xyz.token
  }));
  
  layer.xhr.setRequestHeader('Content-Type', 'application/json');
  layer.xhr.responseType = 'json';
  
  // Draw layer on load event.
  layer.xhr.onload = e => {

    if (layer.view.loader) layer.view.loader.style.display = 'none';

    // Remove layer from map if currently drawn.
    if (layer.L) _xyz.map.removeLayer(layer.L);
  
    if (e.target.status !== 200 || !layer.display) return;
        
    layer.loaded = true;

    // Create cat array for graduated theme.
    if (layer.style.theme) layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat);

    const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

    const features = e.target.response.map(f => geoJSON.readFeature({
      type: 'Feature',
      geometry: f.geometry,
      properties: {
        id: f.properties.id
      }
    },{ 
      dataProjection: `EPSG:${layer.srid}`,
      featureProjection:'EPSG:3857'
    }));
  
    const sourceVector = new _xyz.mapview.lib.source.Vector({features: features});

    layer.L = new _xyz.mapview.lib.layer.Vector({
      source: sourceVector,
      zIndex: layer.style.zIndex || 1,
      style: feature => {

        const properties = feature.getProperties().properties;

        const highlighted = layer.highlight === feature.get('id');

        let style = Object.assign(
          {},
          layer.style.default,
          highlighted ? layer.style.highlight : {});

        // Return default style if no theme is set on layer.
        if (!layer.style.theme) {

          let _style = new _xyz.mapview.lib.style.Style({
            // stroke: new _xyz.mapview.lib.style.Stroke({
            //   color: style.color,
            //   width: style.weight
            // }),
            // fill: new _xyz.mapview.lib.style.Fill({
            //   color: _xyz.utils.hexToRGBA(style.fillColor, style.fillOpacity || 1, true)
            // }),
            image: _xyz.mapview.icon({url: _xyz.utils.svg_symbols(style.marker)})
          });
          
          return _style;

        };
    
        //const theme = layer.style.theme;
    
        // // Categorized theme.
        // if (theme.type === 'categorized') {
    
        //   return Object.assign({}, style, theme.cat[feature.properties.cat] || {});
        
        // }
    
        // // Graduated theme.
        // if (theme.type === 'graduated') {
    
        //   theme.cat_style = {};
        
        //   // Iterate through cat array.
        //   for (let i = 0; i < theme.cat_arr.length; i++) {
        
        //     // Break iteration is cat value is below current cat array value.
        //     if (parseFloat(feature.properties.cat) < parseFloat(theme.cat_arr[i][0])) break;
        
        //     // Set cat_style to current cat style after value check.
        //     theme.cat_style = theme.cat_arr[i][1];
        
        //   }
        
        //   // Assign style from base & cat_style.
        //   return Object.assign({}, style, theme.cat_style);
        
        // }

      }
    });

    _xyz.map.addLayer(layer.L);

    layer.L.set('layer',layer,true);
           
    // Check whether layer.display has been set to false during the drawing process and remove layer from map if necessary.
    if (!layer.display) _xyz.map.removeLayer(layer.L);
    
  };
      
  layer.xhr.send();

  function _select(e, feature) {

    _xyz.locations.select({
      locale: _xyz.workspace.locale.key,
      layer: layer.key,
      table: layer.table,
      id: feature.get('id'),
      marker: _xyz.mapview.lib.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326'),
      edit: layer.edit
    });

  }

  function _hover(e, feature) {

    console.log(feature);

    if (layer.hover.field) layer.hover.add({
      id: feature.getId(),
      x: e.originalEvent.clientX,
      y: e.originalEvent.clientY,
    });

  }

};