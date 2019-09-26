import select from './select.mjs';

import infotip from './infotip.mjs';

export default _xyz => layer => {

  layer.highlight = true;

  layer.select = select(_xyz);

  layer.infotip = infotip(_xyz);

  layer.reload = () => {

    source.refresh();

  };

 
  const source = new _xyz.mapview.lib.source.Vector({
    loader: function() {

      if (layer.xhr) layer.xhr.abort();
      
      source.clear();
  
      const tableZ = layer.tableCurrent();

      if (!tableZ) return;
  
      // Show loader.
      if (layer.view.loader) layer.view.loader.style.display = 'block';
  
      layer.xhr = new XMLHttpRequest();   
      
      layer.xhr.open('GET', _xyz.host + '/api/layer/geojson?' + _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: layer.key,
        table: tableZ,
        cat: layer.style.theme && layer.style.theme.field,
        filter: JSON.stringify(layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current)),
        token: _xyz.token
      }));

      layer.xhr.setRequestHeader('Content-Type', 'application/json');
      layer.xhr.responseType = 'json';

      layer.xhr.onload = e => {

        // Hide loader.
        if (layer.view.loader) layer.view.loader.style.display = 'none';

        if (e.target.status !== 200) return;

        const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

        const features = e.target.response.map(f => geoJSON.readFeature({
          type: 'Feature',
          geometry: f.geometry,
          properties: {
            id: f.properties.id
          }
        },{ 
          dataProjection: 'EPSG:' + layer.srid,
          featureProjection: 'EPSG:' + _xyz.mapview.srid
        }));

        source.addFeatures(features);

      };

      layer.xhr.send();

    },
    strategy: function(extent, resolution) {

      // Required to fire the load event.
      if(this.resolution && this.resolution != resolution){
        this.loadedExtentsRtree_.clear();
      }
  
      return [_xyz.mapview.lib.proj.transformExtent(
        extent,
        'EPSG:' + _xyz.mapview.srid,
        'EPSG:' + layer.srid)];
    }
  });
  
  layer.L = new _xyz.mapview.lib.layer.Vector({
    source: source,
    zIndex: layer.style.zIndex || 1,
    style: feature => {

      const style = Object.assign(
        {},
        layer.style.default
      );
      
      const theme = layer.style.theme;
    
      // Categorized theme.
      if (theme && theme.type === 'categorized') {
    
        Object.assign(
          style,
          theme.cat[feature.get(theme.field)].style || {}
        );
    
      }
    
      // Graduated theme.
      if (theme && theme.type === 'graduated' && theme.cat_arr) {
     
        const value = parseFloat(feature.get(theme.field));
    
        if (value) {
  
          // Iterate through cat array.
          for (let i = 0; i < theme.cat_arr.length; i++) {
    
            // Break iteration is cat value is below current cat array value.
            if (value < theme.cat_arr[i].value) break;
    
            // Set cat_style to current cat style after value check.
            var cat_style = theme.cat_arr[i].style;
          }
    
          // Assign style from base & cat_style.
          Object.assign(
            style,
            cat_style
          );
  
        }
      
      }
  
      Object.assign(
        style,
        layer.highlight === feature.get('id') ? layer.style.highlight : {},
        layer.highlight === feature.get('id') ? {zIndex : 30} : {zIndex : 10},
      );
  
      return new _xyz.mapview.lib.style.Style({
        zIndex: style.zIndex,
        stroke: style.strokeColor && new _xyz.mapview.lib.style.Stroke({
          color: style.strokeColor,
          width: parseInt(style.strokeWidth) || 1
        }),
        fill: style.fillColor && new _xyz.mapview.lib.style.Fill({
          color: _xyz.utils.Chroma(style.fillColor).alpha(style.fillOpacity === 0 ? 0 : parseFloat(style.fillOpacity) || 1).rgba()
        }),
        image: style.marker && _xyz.mapview.icon(style.marker)
      });

    }
  });

  layer.L.set('layer', layer, true);

};