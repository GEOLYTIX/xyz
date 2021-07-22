import select from './selectCluster.mjs';

import infotip from './infotip.mjs';

export default _xyz => layer => {

  layer.highlight = true;

  layer.select = select(_xyz);

  layer.infotip = infotip(_xyz);

  layer.reload = () => {

    source.clear();
    source.refresh({force: true});
  };

  function loader (extent) {

    source.clear(true)

    if (layer.xhr) layer.xhr.abort()

    source.clear()

    const tableZ = layer.tableCurrent()

    if (!tableZ) return

    layer.xhr = new XMLHttpRequest()

    layer.xhr.open(
      'GET', _xyz.host + `/api/layer/cluster/${_xyz.mapview.getZoom()}?` +
        _xyz.utils.paramString({
          locale: _xyz.locale.key,
          layer: layer.key,
          table: tableZ,
          kmeans: layer.cluster_kmeans,
          dbscan: layer.cluster_dbscan,
          pixelRatio: window.devicePixelRatio,
          aggregate: layer.style.theme && layer.style.theme.aggregate,
          theme: layer.style.theme && layer.style.themes && encodeURIComponent(Object.keys(layer.style.themes).find(k => layer.style.themes[k] === layer.style.theme)),
          label: layer.style.label && layer.style.label.field,
          count: layer.style.label && layer.style.label.count,
          filter: layer.filter && layer.filter.current,
          viewport: [extent[0], extent[1], extent[2], extent[3]]
        }));

    layer.xhr.setRequestHeader('Content-Type', 'application/json');
    layer.xhr.responseType = 'json';

    // Draw layer on load event.
    layer.xhr.onload = e => {
  
      if (e.target.status !== 200) return;

      const cluster = e.target.response;

      layer.max_size = cluster.reduce((max_size, f) => Math.max(max_size, f.properties.size), 0);
    
      let id = 1;
    
      const features = cluster.map(f => new ol.Feature({
        id: id++,
        geometry: new ol.geom.Point(
          layer.srid == 4326 && ol.proj.fromLonLat([f.geometry.x, f.geometry.y]) || [f.geometry.x, f.geometry.y]
        ),
        properties: f.properties
      }));

      source.addFeatures(features);
    
    };

    layer.xhr.send();

  }

  const source = new ol.source.Vector({
    loader: () => {},
    strategy: function(extent) {

      extent = [ol.proj.transformExtent(extent, 'EPSG:' + _xyz.mapview.srid, 'EPSG:' + layer.srid)]

      const bbox = extent.join(',');
      if (bbox != this.get('bbox')) {
        this.set('bbox', bbox)
        loader(extent)
      }
  
      return extent
    }
  });
 
  layer.L = new ol.layer.Vector({
    layer: layer,
    source: source,
    zIndex: layer.style.zIndex || 10,
    style: feature => {

      const properties = feature.getProperties().properties;
  
      const marker = properties.size > 1 ?
        Object.assign({}, layer.style.default, layer.style.cluster) :
        Object.assign({}, layer.style.default);

      marker.scale = marker.scale || 1

      const theme = Object.assign({}, layer.style.theme);
  
      // Categorized theme
      if (theme && theme.type === 'categorized') {

        Object.assign(
          marker,
          theme.cat[properties.cat] && theme.cat[properties.cat].style || theme.cat[properties.cat]);
      }
  
      // Graduated theme.
      if (theme && theme.type === 'graduated') {
  
        const value = parseFloat(properties.cat);

        if (value || value === 0) {

          // Iterate through cat array.
          for (let i = 0; i < theme.cat_arr.length; i++) {
    
            // Break iteration is cat value is below current cat array value.
            if (value < theme.cat_arr[i].value) break;
      
            // Set cat_style to current cat style after value check.
            var cat_style = theme.cat_arr[i].style || theme.cat_arr[i];
          }
  
          // Assign style from base & cat_style.
          Object.assign(marker, cat_style);
        }
      }
  
      // Competition theme.
      if (theme && theme.type === 'competition') {
  
        // Set counter for point to 0.
        let size = properties.size;
  
        // Create a new cat_style with an empty layers object to store the competition layers.
        let cat_style = { layers: {} };
  
        // Iterate through cats in competition theme.
        Object.entries(properties.cat).sort((a, b) => a[1] - b[1]).forEach(comp => {
  
          // Check for the competition cat in point properties.
          if (theme.cat[comp[0]]) {
  
            // Add a cat layer to the marker object.
            // Calculate the size of the competition layer.
            // Competition layer added first must be largest.
            cat_style.layers[size / properties.size] = theme.cat[comp[0]].style.fillColor;
          }
  
          // Reduce the current size by the size of layer just added to marker.
          size -= comp[1];
        });

        Object.assign({}, marker, cat_style);
      }

      let size = layer.cluster_logscale ?
        properties.count === 1 ?
          (marker.size || layer.style.size) :
          (marker.size || layer.style.size) + (marker.size || layer.style.size) / Math.log(layer.max_size) * Math.log(properties.size) :
        properties.count === 1 ?
          (marker.size || layer.style.size) :
          (marker.size || layer.style.size) + (marker.size || layer.style.size) / layer.max_size * properties.size;

      
      if (layer.highlight === feature.get('id')){

        let tmpHighlightStyle = _xyz.utils.cloneDeep(layer.style.highlight);

        delete tmpHighlightStyle.scale

        // quick and dirty fix for scaling highlight
        if (marker.scale && layer.style.highlight.scale) {
          marker.scale *= layer.style.highlight.scale
        }

        Object.assign(marker, tmpHighlightStyle);

      }

      if(marker.layers && Array.isArray(marker.layers)) {

        return marker.layers.map(l => {
          return new ol.style.Style({
            zIndex: parseInt(layer.max_size - properties.size),
            image: _xyz.mapview.icon(Object.assign({}, l, {
              scale: size/(l.size || layer.style.size) * (l.scale || 1) * (l.relative ? _xyz.mapview.getZoom()/(_xyz.locale.maxZoom-_xyz.locale.minZoom) : 1)
            }))
          })
        })
      
      }

      return new ol.style.Style({
        zIndex: layer.style.zIndex,
        image: _xyz.mapview.icon(Object.assign({},
          marker,
          {
            scale: size/(marker.size || layer.style.size) * (marker.scale || 1) * (marker.relative ? _xyz.mapview.getZoom()/(_xyz.locale.maxZoom-_xyz.locale.minZoom) : 1)
          }))
      });

    }
  });

  layer.label = _xyz.mapview.layer.clusterLabel(layer);

};