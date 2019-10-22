import select from './selectCluster.mjs';

import infotip from './infotip.mjs';

import label from './clusterLabel.mjs';

export default _xyz => layer => {

  layer.highlight = true;

  layer.select = select(_xyz);

  layer.infotip = infotip(_xyz);

  layer.reload = () => {

    source.clear();
    source.refresh({force: true});
  };

  const source = new _xyz.mapview.lib.source.Vector({
    loader: function (extent, resolution, projection) {

      if (layer.xhr) layer.xhr.abort();
  
      this.resolution = resolution;
  
      source.clear();
  
      const tableZ = layer.tableCurrent();

      if (!tableZ) return;
  
      // Show loader.
      if (layer.view.loader) layer.view.loader.style.display = 'block';
  
      layer.xhr = new XMLHttpRequest();   
  
      layer.xhr.open(
        'GET', _xyz.host + '/api/layer/cluster?' +
          _xyz.utils.paramString({
            locale: _xyz.workspace.locale.key,
            layer: layer.key,
            table: tableZ,
            kmeans: layer.cluster_kmeans,
            dbscan: layer.cluster_dbscan,
            pixelRatio: window.devicePixelRatio,
            theme: layer.style.theme && layer.style.theme.type,
            cat: layer.style.theme && layer.style.theme.field,
            size: layer.style.theme && layer.style.theme.size,
            aggregate: layer.style.theme && layer.style.theme.aggregate,
            label: layer.style.label && layer.style.label.field,
            filter: JSON.stringify(layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current)),
            west: extent[0],
            south: extent[1],
            east: extent[2],
            north: extent[3],
            z: _xyz.mapview.getZoom(),
            token: _xyz.token
          }));
  
      layer.xhr.setRequestHeader('Content-Type', 'application/json');
      layer.xhr.responseType = 'json';
  
      // Draw layer on load event.
      layer.xhr.onload = e => {
  
        if (layer.view.loader) layer.view.loader.style.display = 'none';
  
        if (e.target.status !== 200) return;

        const cluster = e.target.response;

        layer.max_size = cluster.reduce((max_size, f) => Math.max(max_size, f.properties.size), 0);
      
        let id = 0;
      
        const features = cluster.map(f => new _xyz.mapview.lib.Feature({
          id: id++,
          geometry: new _xyz.mapview.lib.geom.Point(
            layer.srid == 4326 && _xyz.mapview.lib.proj.fromLonLat([f.geometry.x, f.geometry.y]) || [f.geometry.x, f.geometry.y]
          ),
          properties: f.properties
        }));
  
        source.addFeatures(features);
      
      };
  
      layer.xhr.send();
  
    },
    strategy: function(extent, resolution) {

      // Required to fire the load event.
      this.resolution && this.resolution != resolution && this.loadedExtentsRtree_.clear();
  
      return [_xyz.mapview.lib.proj.transformExtent(extent, 'EPSG:' + _xyz.mapview.srid, 'EPSG:' + layer.srid)];
    }
  });
  
  layer.L = new _xyz.mapview.lib.layer.Vector({
    layer: layer,
    source: source,
    zIndex: layer.style.zIndex || 1,
    style: feature => {

      const properties = feature.getProperties().properties;
  
      const marker = properties.size > 1 ?
        Object.assign({}, layer.style.markerMulti) :
        Object.assign({}, layer.style.marker);

      const theme = Object.assign({}, layer.style.theme);
  
      // Categorized theme
      if (theme && theme.type === 'categorized') {

        let cat = {};

        if( theme.cat[properties.cat]) {
          if(theme.cat[properties.cat].svg) cat = theme.cat[properties.cat];
          if(theme.cat[properties.cat].style) cat = theme.cat[properties.cat].style;
        }

        Object.assign(marker, cat);

      }
  
      // Graduated theme.
      if (theme && theme.type === 'graduated') {
  
        const value = parseFloat(properties.cat);

        if (value) {

          // Iterate through cat array.
          for (let i = 0; i < theme.cat_arr.length; i++) {
    
            // Break iteration is cat value is below current cat array value.
            if (value < theme.cat_arr[i].value) break;
      
            // Set cat_style to current cat style after value check.
            var cat_style = theme.cat_arr[i].style;
          }
  
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

      const size = layer.cluster_logscale ?
        properties.count === 1 ?
          layer.style.markerMin :
          layer.style.markerMin + layer.style.markerMax / Math.log(layer.max_size) * Math.log(properties.size) :
        properties.count === 1 ?
          layer.style.markerMin :
          layer.style.markerMin + layer.style.markerMax / layer.max_size * properties.size;

      Object.assign(marker, layer.highlight === feature.get('id') && layer.style.highlight);

      return new _xyz.mapview.lib.style.Style({
        zIndex: parseInt(layer.max_size - properties.size),
        image: _xyz.mapview.icon(Object.assign({},
          marker,
          {
            scale: (size / 40) * (marker.scale || 0.05)
          }))
      });

    }
  });

  layer.label = label(_xyz, layer);

};