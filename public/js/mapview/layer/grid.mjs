export default _xyz => layer => {

  layer.grid_size = Object.values(layer.grid_fields)[0];

  layer.grid_color = Object.values(layer.grid_fields)[1];

  layer.grid_ratio = false;

  layer.reload = () => source.refresh();

  const source = new _xyz.mapview.lib.source.Vector({ 
    loader: function (extent, resolution, projection) {

      if (layer.xhr) layer.xhr.abort();

      this.resolution = resolution;

      source.clear();

      const tableZ = layer.tableCurrent();

      if (!tableZ) return;

      layer.xhr = new XMLHttpRequest();   

      layer.xhr.open('GET', _xyz.host + '/api/layer/grid?' + _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: layer.key,
        table: tableZ,
        size: layer.grid_size,
        color: layer.grid_color,
        west: extent[0],
        south: extent[1],
        east: extent[2],
        north: extent[3],
        token: _xyz.token
      }));

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
            if (layer.grid_ratio && record[3] > 0) record[3] /= record[2];
      
            layer.sizeAvg += parseFloat(record[2]);
            layer.colorAvg += isNaN(record[3]) ? 0 : parseFloat(record[3]);
      
            return new _xyz.mapview.lib.Feature({
              geometry: new _xyz.mapview.lib.geom.Point(
                _xyz.mapview.lib.proj.fromLonLat([record[0], record[1]])),
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

        source.addFeatures(dots);

        if (layer.style.legend.size_min) layer.style.legend.size_min.textContent = layer.sizeMin.toLocaleString('en-GB', { maximumFractionDigits: 0 });
        if (layer.style.legend.size_avg) layer.style.legend.size_avg.textContent = layer.sizeAvg.toLocaleString('en-GB', { maximumFractionDigits: 0 });
        if (layer.style.legend.size_max) layer.style.legend.size_max.textContent = layer.sizeMax.toLocaleString('en-GB', { maximumFractionDigits: 0 });

        if (layer.grid_ratio) {

          if (layer.style.legend.color_min) layer.style.legend.color_min.textContent = layer.colorMin.toLocaleString('en-GB', { maximumFractionDigits: 0, style: 'percent' });
          if (layer.style.legend.color_avg) layer.style.legend.color_avg.textContent = layer.colorAvg.toLocaleString('en-GB', { maximumFractionDigits: 0, style: 'percent' });
          if (layer.style.legend.color_max) layer.style.legend.color_max.textContent = layer.colorMax.toLocaleString('en-GB', { maximumFractionDigits: 0, style: 'percent' });

        } else {

          if (layer.style.legend.color_min) layer.style.legend.color_min.textContent = layer.colorMin.toLocaleString('en-GB', { maximumFractionDigits: 0 });
          if (layer.style.legend.color_avg) layer.style.legend.color_avg.textContent = layer.colorAvg.toLocaleString('en-GB', { maximumFractionDigits: 0 });
          if (layer.style.legend.color_max) layer.style.legend.color_max.textContent = layer.colorMax.toLocaleString('en-GB', { maximumFractionDigits: 0 });

        }

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

      const properties = feature.getProperties().properties;

      // Distribute size between min, avg and max.
      const size = properties.size <= layer.sizeAvg ?
        7 + 7 / layer.sizeAvg * properties.size :
        14 + 7 / (layer.sizeMax - layer.sizeAvg) * (properties.size - layer.sizeAvg);

        // set to no value colour.
      properties.hxcolor = '#C0C0C0';

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

      return new _xyz.mapview.lib.style.Style({
        image: _xyz.mapview.icon({
          type: 'dot',
          fillColor: properties.hxcolor,
          scale: size / 40 * 0.05
        })
      });

    }
  });

  layer.L.set('layer', layer, true);
  
};