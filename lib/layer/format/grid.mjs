export default layer => {

  layer.grid_size = Object.values(layer.grid_fields)[0];

  layer.grid_color = Object.values(layer.grid_fields)[1];

  layer.grid_ratio = false;

  layer.reload = loader

  function loader () {

    if (!layer.display) return;

    if (layer.xhr) layer.xhr.abort();

    const tableZ = layer.tableCurrent();

    if (!tableZ) {
      layer.L.getSource().clear()
      return;
    }

    const extent = ol.proj.transformExtent(
      layer.mapview.Map.getView().calculateExtent(layer.mapview.Map.getSize()),
      `EPSG:${layer.mapview.srid}`,
      `EPSG:${layer.srid}`)

    layer.xhr = new XMLHttpRequest()

    layer.xhr.open(
      "GET",
      `${layer.mapview.host}/api/layer/grid?` +
        mapp.utils.paramString({
          locale: layer.mapview.locale.key,
          layer: layer.key,
          table: tableZ,
          size: layer.grid_size,
          color: layer.grid_color,
          viewport: [extent[0], extent[1], extent[2], extent[3]],
        })
    );

    layer.xhr.setRequestHeader('Content-Type', 'application/json');
    layer.xhr.responseType = 'json';

    // Draw layer on load event.
    layer.xhr.onload = e => {

      if (e.target.status !== 200) return;

      const data = e.target.response;
    
      layer.sizeAvg = 0;
      layer.colorAvg = 0;
    
      const dots = data.map(record => {
    
        // 0 lat
        // 1 lon
        // 2 size
        // 3 color
        if (parseFloat(record[2]) > 0) {
          record[2] = isNaN(record[2]) ? record[2] : parseFloat(record[2]);
          record[3] = isNaN(record[3]) ? record[3] : parseFloat(record[3]);
    
          // Check for grid_ratio
          if (layer.grid_ratio && record[3] > 0) {

            //console.log(`${record[3]} / ${record[2]}`)
            record[3] /= record[2]
          }
    
          layer.sizeAvg += parseFloat(record[2]);
          layer.colorAvg += isNaN(record[3]) ? 0 : parseFloat(record[3]);
    
          return new ol.Feature({
            geometry: new ol.geom.Point(
              ol.proj.fromLonLat([record[0], record[1]])),
            properties: {
              size: parseFloat(record[2]),
              color: isNaN(record[3]) ? record[3] : parseFloat(record[3])
            }
          });
    
        }
      });
    
      // Apply maths function to a column in a two dimensional array of numbers.
      function getMath(arr, idx, type) {
    
        // Filter numbers from array column idx.
        const numbers = arr.filter(n => isFinite(n[idx]));
    
        // Apply math function to the filtered numbers array.
        return Math[type].apply(null, numbers.map(val => val[idx]));
      }
    
      layer.sizeMin = getMath(data, 2, 'min');
      layer.sizeAvg /= dots.length;
      layer.sizeMax = getMath(data, 2, 'max');
    
      layer.colorMin = getMath(data, 3, 'min');
      layer.colorAvg /= dots.length;
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

      // source.addFeatures(dots);
      layer.L.setSource(new ol.source.Vector({
        useSpatialIndex: false,
        features: dots,
      }))

      layer.style.legend?.dispatchEvent(new Event('update'))
    }

    layer.xhr.send()

  }

  layer.L = new ol.layer.Vector({
    zIndex: layer.style.zIndex || 1,
    style: feature => {

      const properties = feature.getProperties().properties;

      // Distribute size between min, avg and max.
      const size = properties.size <= layer.sizeAvg ?
        7 + 7 / layer.sizeAvg * properties.size :
        14 + 7 / (layer.sizeMax - layer.sizeAvg) * (properties.size - layer.sizeAvg);

        // set to no value colour.
      properties.hxcolor = layer.style.hxcolor || '#C0C0C0';

      if (parseFloat(properties.color)) {

        // set to min colour.
        properties.hxcolor = layer.style.range[0];

        for (let i = 0; i < layer.colorBins.length; i++) {

          // Break iteration is cat value is below current cat array value.
          if (properties.color < layer.colorBins[i]) break;

          // Set cat_style to current cat style after value check.
          properties.hxcolor = layer.style.range[i + 1];
        }

      }

      return mapp.utils.style({
        icon: {
          type: 'dot',
          fillColor: properties.hxcolor,
          scale: size / 30
        }
      })
    }
  })

  layer.mapview.Map.getTargetElement().addEventListener('changeEnd', loader)
}