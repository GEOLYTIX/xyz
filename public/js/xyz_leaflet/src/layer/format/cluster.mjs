export default (_xyz, layer) => () => {

  // Get table for the current zoom level.
  const table = layer.tableCurrent();

  // Return if layer should not be displayed.
  if (!layer.display) return;

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
  
  // Get bounds for request.
  const bounds = _xyz.map.getBounds();

  if (layer.xhr) {
    layer.xhr.abort();
    layer.xhr.onload = null;
  }

  // Create XHR for fetching data from middleware.
  layer.xhr = new XMLHttpRequest();
      
  // Build XHR request.
  layer.xhr.open('GET', _xyz.host + '/api/layer/cluster?' + _xyz.utils.paramString({
    locale: layer.locale,
    layer: layer.key,
    table: layer.table,
    kmeans: layer.cluster_kmeans,// * window.devicePixelRatio,
    dbscan: layer.cluster_dbscan,// * window.devicePixelRatio,
    theme: layer.style.theme && layer.style.theme.type,
    cat: layer.style.theme && layer.style.theme.field,
    size: layer.style.theme && layer.style.theme.size,
    filter: JSON.stringify(filter),
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
    token: _xyz.token
  }));

  layer.xhr.setRequestHeader('Content-Type', 'application/json');
  layer.xhr.responseType = 'json';
    
  // Process XHR onload.
  layer.xhr.onload = e => {

    if (layer.loader) layer.loader.style.display = 'none';

    // Check for existing layer and remove from map.
    if (layer.L) _xyz.map.removeLayer(layer.L);
           
    // Data is returned and the layer is still current.
    if (e.target.status !== 200 || !layer.display) return;

    if (layer.attribution) _xyz.attribution.set(layer.attribution);
    
    const cluster = e.target.response;

    const param = {
      max_size:
        cluster.reduce((max_size, f) => Math.max(max_size, f.properties.size), 0)
    };

      // Create cat array for graduated theme.
    if (layer.style.theme && layer.style.theme.type === 'graduated') {
      layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    }
    
    // Add cluster as point layer to Leaflet.
    layer.L = _xyz.L.geoJson(cluster, {
      pointToLayer: (point, latlng) => {
        
        param.marker = layer.style.marker;

        // Set tooltip for desktop if corresponding layer has hover property.
        // let tooltip = (layer.style.theme && layer.style.theme.hover && _xyz.view.mode === 'desktop') || false;

        if(point.properties.size > 1) param.marker = layer.style.markerMulti;

        // Return marker if no theme is set.
        if (!layer.style.theme) return marker(latlng, layer, point, param);


        // Categorized theme
        if (layer.style.theme.type === 'categorized') {

          // Get cat style from theme if cat is defined.
          param.cat_style = layer.style.theme.cat[point.properties.cat] || {};

          // Assign marker from base & cat_style.
          param.marker = Object.assign({}, param.marker, param.cat_style);

          return marker(latlng, layer, point, param);
        }

        // Graduated theme.
        if (layer.style.theme.type === 'graduated') {

          param.cat_style = {};
    
          // Iterate through cat array.
          for (let i = 0; i < layer.style.theme.cat_arr.length; i++) {
    
            // Break iteration is cat value is below current cat array value.
            if (point.properties.cat < parseFloat(layer.style.theme.cat_arr[i][0])) break;
    
            // Set cat_style to current cat style after value check.
            param.cat_style = layer.style.theme.cat_arr[i][1];
          }
  
          // Assign marker from base & cat_style.
          param.marker = Object.assign({}, param.marker, param.cat_style);

          return marker(latlng, layer, point, param);
        }


        // Competition theme.
        if (layer.style.theme.type === 'competition') {

          // Set counter for point to 0.
          let size = point.properties.size;

          // Create a new cat_style with an empty layers object to store the competition layers.
          param.cat_style = {
            layers: {}
          };

          // Iterate through cats in competition theme.
          //Object.keys(point.properties.cat).forEach(comp => {
          Object.entries(point.properties.cat).sort((a, b) => a[1] - b[1]).forEach(comp => {

            // Check for the competition cat in point properties.
            if (layer.style.theme.cat[comp[0]]) {
              
              // Add a cat layer to the marker obkject.
              // Calculate the size of the competition layer.
              // Competition layer added first must be largest.
              param.cat_style.layers[size / point.properties.size] = layer.style.theme.cat[comp[0]].fillColor;

            }
            
            // Reduce the current size by the size of layer just added to marker.
            size -= comp[1];

          });

          // Assign marker from base & cat_style.
          param.marker = Object.assign({}, param.marker, param.cat_style);

          return marker(latlng, layer, point, param);
        }
            
      }
    })
      .on('click', e => {
        let
          count = e.layer.feature.properties.count,
          lnglat = e.layer.feature.geometry.coordinates;
    
        const xhr = new XMLHttpRequest();
      
        xhr.open('GET', _xyz.host + '/api/location/select/cluster?' + _xyz.utils.paramString({
          locale: _xyz.locale,
          layer: layer.key,
          table: layer.table,
          filter: JSON.stringify(layer.filter.current),
          count: count > 99 ? 99 : count,
          lnglat: lnglat,
          token: _xyz.token
        }));
    
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';
      
        xhr.onload = e => {
      
          if (e.target.status !== 200) return;
        
          let cluster = e.target.response;
    
          if (cluster.length > 1) return _xyz.locations.select_list(cluster, lnglat, layer);
      
          if (cluster.length === 1) return _xyz.locations.select({
            locale: layer.locale,
            layer: layer.key,
            table: layer.table,
            id: cluster[0].id,
            marker: cluster[0].lnglat,
            edit: layer.edit
          });
      
        };
      
        xhr.send();
      })
      .addTo(_xyz.map);

    function marker(latlng, layer, point, param){

      param.icon = _xyz.utils.svg_symbols(param.marker);

      // Define iconSize base on the point size in relation to the max_size.
      let iconSize = layer.cluster_logscale ?
        point.properties.count === 1 ?
          layer.style.markerMin :
          layer.style.markerMin + layer.style.markerMax / Math.log(param.max_size) * Math.log(point.properties.size) :
        point.properties.count === 1 ?
          layer.style.markerMin :
          layer.style.markerMin + layer.style.markerMax / param.max_size * point.properties.size;

      return _xyz.L.marker(latlng, {
        pane: layer.key,
        // offset base on size draws bigger cluster first.
        zIndexOffset: parseInt(1000 - 1000 / param.max_size * point.properties.size),
        icon: _xyz.L.icon({
          iconUrl: param.icon,
          iconSize: iconSize
        }),
        interactive: (layer.qID) ? true : false
      });
    }

  };
    
  layer.xhr.send();

};