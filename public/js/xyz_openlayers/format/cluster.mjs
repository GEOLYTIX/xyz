export default _xyz => layer => () => {

  // Return if layer should not be displayed.
  if (!layer.display || layer.L) return;

  layer.L = new _xyz.mapview.lib.layer.Vector({
    source: new _xyz.mapview.lib.source.Vector({
      loader: function (extent, resolution, projection) {
  
        if (layer.xhr) layer.xhr.abort();
    
        this.resolution = resolution;
    
        layer.L.getSource().clear();
    
        layer.table = layer.tableCurrent();
    
        if (!layer.table) return;
    
        // Show loader.
        if (layer.view.loader) layer.view.loader.style.display = 'block';
    
        layer.xhr = new XMLHttpRequest();   
    
        layer.xhr.open(
          'GET', _xyz.host + '/api/layer/cluster?' +
            _xyz.utils.paramString({
              locale: _xyz.workspace.locale.key,
              layer: layer.key,
              table: layer.table,
              resolution: layer.cluster_resolution,
              kmeans: layer.cluster_kmeans,// * window.devicePixelRatio,
              dbscan: layer.cluster_dbscan,// * window.devicePixelRatio,
              aggregate: layer.style.theme && layer.style.theme.aggregate,
              theme: layer.style.theme && layer.style.theme.type,
              cat: layer.style.theme && layer.style.theme.field,
              size: layer.style.theme && layer.style.theme.size,
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
            geometry: geometry(f.geometry),
            properties: f.properties
          }));
        
          function geometry(geom) {
            if (geom.lon && geom.lat) {
              return new _xyz.mapview.lib.geom.Point(
                _xyz.mapview.lib.proj.fromLonLat([geom.lon, geom.lat])
              );
            }
        
            if (geom.x && geom.y) {
              return new _xyz.mapview.lib.geom.Point([geom.x, geom.y]);
            }
          }
    
          layer.L.getSource().addFeatures(features);
        
        };
    
        layer.xhr.send();
    
      },
      strategy: function(extent, resolution) {
  
        // Required to fire the load event.
        if(this.resolution && this.resolution != resolution){
          this.loadedExtentsRtree_.clear();
        }
    
        return [_xyz.mapview.lib.proj.transformExtent(extent,'EPSG:3857','EPSG:'+layer.srid)];
      }
    }),
    zIndex: layer.style.zIndex || 1,
    style: feature => {

      const properties = feature.getProperties().properties;
  
      let marker = layer.style.marker;
  
      if (properties.size > 1) marker = layer.style.markerMulti;
  
      const theme = layer.style.theme;
  
      // Categorized theme
      if (theme && theme.type === 'categorized') {
  
        Object.assign(
          marker,
          theme.cat[properties.cat] || {}
        );
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
  
          Object.assign(
            marker,
            cat_style
          );

        }
  
      }
  
      // Competition theme.
      if (theme && theme.type === 'competition') {
  
        // Set counter for point to 0.
        let size = properties.size;
  
        // Create a new cat_style with an empty layers object to store the competition layers.
        let cat_style = {
          layers: {}
        };
  
          // Iterate through cats in competition theme.
          //Object.keys(point.properties.cat).forEach(comp => {
        Object.entries(properties.cat).sort((a, b) => a[1] - b[1]).forEach(comp => {
  
          // Check for the competition cat in point properties.
          if (theme.cat[comp[0]]) {
  
            // Add a cat layer to the marker obkject.
            // Calculate the size of the competition layer.
            // Competition layer added first must be largest.
            cat_style.layers[size / properties.size] = theme.cat[comp[0]].fillColor;
  
          }
  
          // Reduce the current size by the size of layer just added to marker.
          size -= comp[1];
  
        });
  
        Object.assign(marker, cat_style);
      }

      const _marker = Object.assign(
        {},
        marker,
        layer.highlight === feature.get('id') ? layer.style.highlight : {}
      );

        
      const iconSize = layer.cluster_logscale ?
        properties.count === 1 ?
          layer.style.markerMin :
          layer.style.markerMin + layer.style.markerMax / Math.log(layer.max_size) * Math.log(properties.size) :
        properties.count === 1 ?
          layer.style.markerMin :
          layer.style.markerMin + layer.style.markerMax / layer.max_size * properties.size;

  
      return new _xyz.mapview.lib.style.Style({
        zIndex: parseInt(layer.max_size - properties.size),
        image: _xyz.mapview.icon({
          url: _xyz.utils.svg_symbols(_marker),
          iconSize: iconSize
        })
      });

    }
  });

  _xyz.map.addLayer(layer.L);

  layer.L.set('layer', layer, true);

  // if (layer.style.label && layer.style.label.display) {

  //   layer.label = new _xyz.mapview.lib.layer.Vector({
  //     source: sourceVector,
  //     declutter: true,
  //     zIndex: layer.style.zIndex || 1,
  //     style: feature => {
  
  //       const properties = feature.getProperties().properties;
       
  //       return new _xyz.mapview.lib.style.Style({
            
  //         text: new _xyz.mapview.lib.style.Text({
  //           text: properties.label,
  //           size: '12px',
  //           stroke: new _xyz.mapview.lib.style.Stroke({
  //             color: '#fff',
  //             width: 3
  //           }),
  //         })
  //       });
  
  //     }
  //   });
  
  //   _xyz.map.addLayer(layer.label);

  // }

  function select(e, feature) {

    let
      count = feature.get('properties').count,
      geom = feature.getGeometry(),
      coords = geom.getCoordinates(),
      lnglat = _xyz.mapview.lib.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');

    const xhr = new XMLHttpRequest();

    const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

    xhr.open('GET', _xyz.host + '/api/location/select/cluster?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: layer.key,
      table: layer.table,
      filter: JSON.stringify(filter),
      count: count > 99 ? 99 : count,
      lnglat: lnglat,
      token: _xyz.token
    }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = e => {

      if (e.target.status !== 200) return;

      let cluster = e.target.response;

      if (cluster.length > 1) {

        const ul = _xyz.utils.wire()`<ul class="scroll-list">`;

        cluster.forEach(li => {
    
          ul.appendChild(_xyz.utils.wire()`<li onclick=${()=>_xyz.locations.select({
            locale: _xyz.workspace.locale.key,
            layer: layer.key,
            table: layer.table,
            id: li.id,
            marker: li.lnglat,
            edit: layer.edit})}>${li.label}`);
    
        });
    
        _xyz.mapview.popup.create({
          coords: coords,
          content: ul
        });
        
        return;

      }

      if (cluster.length === 1) return _xyz.locations.select({
        locale: _xyz.workspace.locale.key,
        layer: layer.key,
        table: layer.table,
        id: cluster[0].id,
        marker: cluster[0].lnglat,
        edit: layer.edit
      });

    };

    xhr.send();
  };

};