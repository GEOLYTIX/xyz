export default (_xyz, layer) => {

  if (!layer.style.label) return;

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
        'GET', _xyz.host + '/api/layer/label?' +
        _xyz.utils.paramString({
          locale: _xyz.workspace.locale.key,
          layer: layer.key,
          table: tableZ,
          label: layer.style.label && layer.style.label.field,
          filter: JSON.stringify(layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current)),
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

        const features = e.target.response.map(f => new _xyz.mapview.lib.Feature({
          geometry: new _xyz.mapview.lib.geom.Point(
            layer.srid == 4326 && _xyz.mapview.lib.proj.fromLonLat([f.geometry.x, f.geometry.y]) || [f.geometry.x, f.geometry.y]
          ),
          properties: f.properties
        }));

        source.addFeatures(features);

      };

      layer.xhr.send();

    },
    strategy: function (extent, resolution) {

      // Required to fire the load event.
      this.resolution && this.resolution != resolution && this.loadedExtentsRtree_.clear();

      return [_xyz.mapview.lib.proj.transformExtent(extent, 'EPSG:' + _xyz.mapview.srid, 'EPSG:' + layer.srid)];
    }
  })

  return new _xyz.mapview.lib.layer.Vector({
    source: source,
    declutter: layer.style.label ? !!layer.style.label.declutter : false,
    zIndex: layer.style.zIndex || 1,
    style: feature => {

      const properties = feature.getProperties().properties;

      return new _xyz.mapview.lib.style.Style({

        text: new _xyz.mapview.lib.style.Text({
          font: layer.style.label.font || '12px sans-serif',
          text: properties.label,
          stroke: layer.style.label.strokeColor && new _xyz.mapview.lib.style.Stroke({
            color: layer.style.label.strokeColor,
            width: layer.style.label.strokeWidth || 1
          }),
          fill: new _xyz.mapview.lib.style.Fill({
            color: layer.style.label.fillColor || '#000'
          })
        })
      });

    }
  });

}