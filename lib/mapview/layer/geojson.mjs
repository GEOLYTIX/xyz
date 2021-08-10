import select from './select.mjs';

import infotip from './infotip.mjs';

export default _xyz => layer => {

  layer.highlight = true;

  layer.select = select(_xyz);

  layer.infotip = infotip(_xyz);

  layer.reload = () => {

    source.refresh();

  };

 
  const source = new ol.source.Vector({
    loader: function() {

      if (layer.xhr) layer.xhr.abort();
      
      source.clear();
  
      const tableZ = layer.tableCurrent();

      if (!tableZ) return;
  
      layer.xhr = new XMLHttpRequest();   
      
      layer.xhr.open('GET', _xyz.host + '/api/layer/geojson?' + _xyz.utils.paramString({
        locale: _xyz.locale.key,
        layer: layer.key,
        table: tableZ,
        cat: layer.style.theme && layer.style.theme.field,
        filter: layer.filter && layer.filter.current
      }));

      layer.xhr.setRequestHeader('Content-Type', 'application/json');
      layer.xhr.responseType = 'json';

      layer.xhr.onload = e => {

        if (e.target.status !== 200) return;

        const geoJSON = new ol.format.GeoJSON();

        const features = e.target.response.map(f => geoJSON.readFeature({
          type: 'Feature',
          geometry: f.geometry,
          properties: {
            id: f.properties.id,
            cat: f.properties.cat
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
  
      return [ol.proj.transformExtent(
        extent,
        'EPSG:' + _xyz.mapview.srid,
        'EPSG:' + layer.srid)];
    }
  });
  
  layer.L = new ol.layer.Vector({
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
          theme.cat[feature.get('cat')] || {}
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

      if (layer.highlight === feature.get('id')){

        let tmpHighlightStyle = _xyz.utils.cloneDeep(layer.style.highlight);

        //tmpHighlightStyle.marker && tmpHighlightStyle.marker.scale && delete tmpHighlightStyle.marker.scale

        // quick and dirty fix for scaling highlight
        if (style.marker && style.marker.scale && tmpHighlightStyle.marker && tmpHighlightStyle.marker.scale) {
          tmpHighlightStyle.marker.scale *= style.marker.scale
        }

        Object.assign(
          style,
          tmpHighlightStyle || {}
        );

      }

      return _xyz.utils.style(style)
  
    }
  })

  layer.L.set('layer', layer, true)

}