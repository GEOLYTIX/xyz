export default _xyz => layer => () => {

  layer.highlight = new Set();

  if (!layer.select) layer.select = _select;

  if (layer.hover) {
    if (!layer.hover.show) layer.hover.show = _hover;
  }

  // Get table for the current zoom level.
  const table = layer.tableCurrent();

  // Return if layer should not be displayed.
  if (!layer.display) return;

  if (!table && layer.L) {
    if (layer.label) _xyz.map.removeLayer(layer.label);
    return _xyz.map.removeLayer(layer.L);
  }

  // Set layer table to be table from tables array.
  layer.table = table;

  // Create filter from legend and current filter.
  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

  // Get bounds for request.
  const bounds = _xyz.mapview.lib.getBounds(layer.srid);

  if (layer.xhr) {
    layer.xhr.abort();
    layer.xhr.onload = null;
    if (layer.L) _xyz.map.removeLayer(layer.L);
    if (layer.label) _xyz.map.removeLayer(layer.label);
  }

  // Create XHR for fetching data from middleware.
  layer.xhr = new XMLHttpRequest();

  // Build XHR request.
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
      filter: JSON.stringify(filter),
      west: bounds.west,
      south: bounds.south,
      east: bounds.east,
      north: bounds.north,
      z: _xyz.mapview.lib.getZoom(),
      token: _xyz.token
    }));

  layer.xhr.setRequestHeader('Content-Type', 'application/json');
  layer.xhr.responseType = 'json';

  // Process XHR onload.
  layer.xhr.onload = e => {

    delete layer.xhr;

    if (layer.view.loader) layer.view.loader.style.display = 'none';

    // Check for existing layer and remove from map.
    if (layer.L) _xyz.map.removeLayer(layer.L);
    if (layer.label) _xyz.map.removeLayer(layer.label);

    // Data is returned and the layer is still current.
    if (e.target.status !== 200 || !layer.display) return;

    const cluster = e.target.response;

    const max_size = cluster.reduce((max_size, f) => Math.max(max_size, f.properties.size), 0);

    // Create cat array for graduated theme.
    if (layer.style.theme && layer.style.theme.type === 'graduated') {
      layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    }

    let id = 0;

    const features = cluster.map(f => new _xyz.mapview.lib.ol.Feature({
      id: id++,
      geometry: geometry(f.geometry),
      properties: f.properties
    }));

    function geometry(geom) {
      if (geom.lon && geom.lat) {
        return new _xyz.mapview.lib.ol.geom.Point(
          _xyz.mapview.lib.ol.proj.fromLonLat([geom.lon, geom.lat])
        );
      }

      if (geom.x && geom.y) {
        return new _xyz.mapview.lib.ol.geom.Point([geom.x, geom.y]);
      }
    }

    const sourceVector = new _xyz.mapview.lib.ol.source.Vector({features: features});

    layer.L = new _xyz.mapview.lib.ol.layer.Vector({
      source: sourceVector,
      zIndex: layer.style.zIndex || 1,
      style: feature => {

        const properties = feature.getProperties().properties;
 
        const marker = style(feature);
        
        const iconSize = layer.cluster_logscale ?
          properties.count === 1 ?
            layer.style.markerMin :
            layer.style.markerMin + layer.style.markerMax / Math.log(max_size) * Math.log(properties.size) :
          properties.count === 1 ?
            layer.style.markerMin :
            layer.style.markerMin + layer.style.markerMax / max_size * properties.size;

  
        return new _xyz.mapview.lib.ol.style.Style({
          zIndex: parseInt(max_size - properties.size),
          image: _xyz.mapview.lib.icon({
            url: _xyz.utils.svg_symbols(marker),
            iconSize: iconSize
          })
        });

      }
    });

    _xyz.map.addLayer(layer.L);

    layer.L.set('layer',layer,true);

    if (layer.style.label && layer.style.label.display) {

      layer.label = new _xyz.mapview.lib.ol.layer.Vector({
        source: sourceVector,
        declutter: true,
        zIndex: layer.style.zIndex || 1,
        style: feature => {
  
          const properties = feature.getProperties().properties;
       
          return new _xyz.mapview.lib.ol.style.Style({
            
            text: new _xyz.mapview.lib.ol.style.Text({
              text: properties.label,
              size: '12px',
              stroke: new _xyz.mapview.lib.ol.style.Stroke({
                color: '#fff',
                width: 3
              }),
            })
          });
  
        }
      });
  
      _xyz.map.addLayer(layer.label);

    }

    function style(feature) {

      const properties = feature.getProperties().properties;

      const highlighted = layer.highlight === feature.get('id');

      let marker = layer.style.marker;

      if (properties.size > 1) marker = layer.style.markerMulti;

      // Return marker if no theme is set.
      if (!layer.style.theme) return marker;

      // Categorized theme
      if (layer.style.theme.type === 'categorized') {

        return Object.assign(
          {},
          marker,
          layer.style.theme.cat[properties.cat] || {},
          highlighted ? layer.style.highlight : {});
      }

      // Graduated theme.
      if (layer.style.theme.type === 'graduated') {

        let cat_style = {};

        // Iterate through cat array.
        for (let i = 0; i < layer.style.theme.cat_arr.length; i++) {

          // Break iteration is cat value is below current cat array value.
          if (properties.cat < parseFloat(layer.style.theme.cat_arr[i][0])) break;

          // Set cat_style to current cat style after value check.
          cat_style = layer.style.theme.cat_arr[i][1];
        }

        return Object.assign({}, marker, cat_style);
      }

      // Competition theme.
      if (layer.style.theme.type === 'competition') {

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
          if (layer.style.theme.cat[comp[0]]) {

            // Add a cat layer to the marker obkject.
            // Calculate the size of the competition layer.
            // Competition layer added first must be largest.
            cat_style.layers[size / properties.size] = layer.style.theme.cat[comp[0]].fillColor;

          }

          // Reduce the current size by the size of layer just added to marker.
          size -= comp[1];

        });

        return Object.assign({}, marker, cat_style);
      }

    }

  };

  layer.xhr.send();

  function _select(e, feature) {

    let
      count = feature.get('properties').count,
      geom = feature.getGeometry(),
      coords = geom.getCoordinates(),
      lnglat = _xyz.mapview.lib.ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');

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

  function _hover(feature) {

    console.log(feature);

  }

};