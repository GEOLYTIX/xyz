export default _xyz => layer => {

  if (!layer.style.label) return;

  const source = new ol.source.Vector({
    loader: function (extent, resolution, projection) {

      if (layer.xhr) layer.xhr.abort();

      this.resolution = resolution;

      source.clear();

      const tableZ = layer.tableCurrent();

      if (!tableZ) return;

      layer.xhr = new XMLHttpRequest();

      layer.xhr.open('GET', _xyz.host + '/api/query?' +
        _xyz.utils.paramString({
          template: 'labels',
          locale: _xyz.locale.key,
          layer: layer.key,
          table: tableZ,
          label: layer.style.label && layer.style.label.field,
          filter: layer.filter && layer.filter.current,
          west: extent[0],
          south: extent[1],
          east: extent[2],
          north: extent[3]
        }));

      layer.xhr.setRequestHeader('Content-Type', 'application/json');
      layer.xhr.responseType = 'json';

      // Draw layer on load event.
      layer.xhr.onload = e => {

        if (e.target.status !== 200) return;

        const features = e.target.response.map(f => new ol.Feature({
          geometry: new ol.geom.Point([f.x, f.y]),
          properties: { label: f.label }
        }));

        source.addFeatures(features);

      };

      layer.xhr.send();

    },
    strategy: function (extent, resolution) {

      // Required to fire the load event.
      this.resolution && this.resolution != resolution && this.loadedExtentsRtree_.clear();

      return [ol.proj.transformExtent(extent, 'EPSG:' + _xyz.mapview.srid, 'EPSG:' + layer.srid)];
    }
  })

  return new ol.layer.Vector({
    source: source,
    declutter: layer.style.label ? !!layer.style.label.declutter : false,
    zIndex: layer.style.zIndex || 1,
    style: feature => {

      const properties = feature.getProperties().properties;

      return new ol.style.Style({

        text: new ol.style.Text({
          font: layer.style.label.font || '12px sans-serif',
          text: properties.label,
          stroke: layer.style.label.strokeColor && new ol.style.Stroke({
            color: layer.style.label.strokeColor,
            width: layer.style.label.strokeWidth || 1
          }),
          fill: new ol.style.Fill({
            color: layer.style.label.fillColor || '#000'
          })
        })
      });

    }
  });

}