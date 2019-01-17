export default (_xyz, layer) => () => {

  // Remove layer from map if currently drawn.
  if (layer.L) _xyz.map.removeLayer(layer.L);

  // Set layer grid_size
  layer.grid_size = layer.grid_size || Object.values(layer.grid_fields)[0];
  
  layer.grid_color = layer.grid_color || Object.values(layer.grid_fields)[0];

  layer.grid_ratio = layer.grid_ratio || false;

  // Get table for the current zoom level.
  const table = layer.tableCurrent();

  // Return if layer should not be displayed.
  if (!layer.display) return;

  if (!table) return layer.loaded = false;

  // Return from layer.get() if table is the same as layer table
  // AND the layer is already loaded.
  if (layer.table === table && layer.loaded) return;

  // Set table to layer.table.
  layer.table = table;

  // Get bounds for request.
  const bounds = _xyz.map.getBounds();

  if (layer.xhr) {
    layer.xhr.abort();
    layer.xhr.onload = null;
  }

  // Create XHR for fetching data from middleware.
  layer.xhr = new XMLHttpRequest();

  if (layer.loader) layer.loader.style.display = 'block';
    
  layer.xhr.open('GET', _xyz.host + '/api/layer/grid?' + _xyz.utils.paramString({
    locale: layer.locale,
    layer: layer.key,
    table: layer.table,
    size: layer.grid_size,
    color: layer.grid_color,
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
    token: _xyz.token
  }));

  layer.xhr.setRequestHeader('Content-Type', 'application/json');
  layer.xhr.responseType = 'json';

  // Draw layer on load event.
  layer.xhr.onload = e => {

    if (layer.loader) layer.loader.style.display = 'none';

    // Check for existing layer and remove from map.
    if (layer.L) _xyz.map.removeLayer(layer.L);

    if (e.target.status !== 200 || !layer.display) return;

    if (layer.attribution) _xyz.attribution.set(layer.attribution);

    // Add geoJSON feature collection to the map.
    layer.L = _xyz.L.geoJson(processGrid(e.target.response), {
      pointToLayer: function (feature, latlng) {

        // Distribute size between min, avg and max.
        let size = feature.properties.size <= layer.sizeAvg ?
          7 + 7 / layer.sizeAvg * feature.properties.size :
          14 + 7 / (layer.sizeMax - layer.sizeAvg) * (feature.properties.size - layer.sizeAvg);

          // set to no value colour.
        feature.properties.hxcolor = '#C0C0C0';

        if (parseFloat(feature.properties.color)) {

          // set to min colour.
          feature.properties.hxcolor = layer.style.range[0];

          for (let i = 0; i < layer.colorBins.length; i++) {

            // Break iteration is cat value is below current cat array value.
            if (feature.properties.color < layer.colorBins[i]) break;
    
            // Set cat_style to current cat style after value check.
            feature.properties.hxcolor = layer.style.range[i + 1];
             
          }

        }

        // Return L.Marker with icon as style to pointToLayer.
        return L.marker(
          latlng,
          {
            icon: _xyz.L.icon({
              iconSize: size,
              iconUrl: _xyz.utils.svg_symbols({
                type: 'dot',
                style: {
                  color: feature.properties.hxcolor
                }
              })
            }),
            pane: layer.key,
            interactive: false
          });
      }
    }).addTo(_xyz.map);

  };
    
  layer.xhr.send();


  function processGrid(data){
    let dots = {
      type: 'FeatureCollection',
      features: []
    };
    layer.sizeAvg = 0;
    layer.colorAvg = 0;
    data.map(function(record){

      // 0 lat
      // 1 lon
      // 2 size
      // 3 color
      if (parseFloat(record[2]) > 0) {
        record[2] = isNaN(record[2]) ? record[2] : parseFloat(record[2]);
        record[3] = isNaN(record[3]) ? record[3] : parseFloat(record[3]);

        // Check for grid_ratio
        if (layer.grid_ratio && record[3] > 0) record[3] /= record[2];

        layer.sizeAvg += parseFloat(record[2]);
        layer.colorAvg += isNaN(record[3]) ? 0 : parseFloat(record[3]);

        dots.features.push({
          'geometry': {
            'type': 'Point',
            'coordinates': [record[0],record[1]]
          },
          'type': 'Feature',
          'properties': {
            'size': parseFloat(record[2]),
            'color': isNaN(record[3]) ? record[3] : parseFloat(record[3])
          }
        });
      }
    });

    layer.sizeMin = getMath(data, 2, 'min');
    layer.sizeAvg /= dots.features.length;
    layer.sizeMax = getMath(data, 2, 'max');

    layer.colorMin = getMath(data, 3, 'min');
    layer.colorAvg /= dots.features.length;
    layer.colorMax = getMath(data, 3, 'max');

    layer.colorBins = [];

    let n = layer.style.range.length;

    for (var i = 1; i < n; i++) {

      if (i < (n / 2)) {
        layer.colorBins.push(layer.colorMin + ((layer.colorAvg - layer.colorMin) / (n / 2) * i));
      }

      if (i === (n / 2)) {
        layer.colorBins.push(layer.colorAvg);
      }

      if (i > (n / 2)) {
        layer.colorBins.push(layer.colorAvg + ((layer.colorMax - layer.colorAvg) / (n / 2) * (i - (n / 2))));
      }
      
    }


    let digits = layer.grid_ratio ? 2 : 0;
    if (layer.style.legend.size_min) layer.style.legend.size_min.textContent = layer.sizeMin.toLocaleString('en-GB', {maximumFractionDigits: 0});
    if (layer.style.legend.size_avg) layer.style.legend.size_avg.textContent = layer.sizeAvg.toLocaleString('en-GB', {maximumFractionDigits: 0});
    if (layer.style.legend.size_max) layer.style.legend.size_max.textContent = layer.sizeMax.toLocaleString('en-GB', {maximumFractionDigits: 0});
    if (layer.style.legend.color_min) layer.style.legend.color_min.textContent = layer.colorMin.toLocaleString('en-GB', {maximumFractionDigits: digits});
    if (layer.style.legend.color_avg) layer.style.legend.color_avg.textContent = layer.colorAvg.toLocaleString('en-GB', {maximumFractionDigits: digits});
    if (layer.style.legend.color_max) layer.style.legend.color_max.textContent = layer.colorMax.toLocaleString('en-GB', {maximumFractionDigits: digits});

    return dots;
  }

  // Apply maths function to a column in a two dimensional array of numbers.
  function getMath(arr, idx, type) {
    
    // Filter numbers from array column idx.
    let numbers = arr.filter(n => isFinite(n[idx]));
    
    // Apply math function to the filtered numbers array.
    return Math[type].apply(null, numbers.map(val => val[idx]));
  }

};