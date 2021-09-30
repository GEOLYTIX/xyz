import select from './select.mjs';

import infotip from './infotip.mjs';

export default _xyz => layer => {

  layer.highlight = true;

  layer.select = select(_xyz);

  layer.infotip = infotip(_xyz);

  layer.reload = () => {
    source.clear();
    loadFeatures()
  };

  let loaded;

  async function loadFeatures() {
    const response = await _xyz.xhr(
      _xyz.host +
        "/api/layer/geojson?" +
        _xyz.utils.paramString({
          locale: _xyz.locale.key,
          layer: layer.key,
          table: layer.table
        })
    );

    const geoJSON = new ol.format.GeoJSON();

    const features = response.map((f) =>
    new ol.Feature({
      id: f.id,
      geometry: geoJSON.readGeometry(f.geometry, {
        dataProjection: "EPSG:" + layer.srid,
        featureProjection: "EPSG:" + _xyz.mapview.srid,
      })
    }))

    source.addFeatures(features);
  }
 
  const source = new ol.source.Vector({
    loader: () => {},
    strategy: function(extent) {

      extent = [ol.proj.transformExtent(extent, 'EPSG:' + _xyz.mapview.srid, 'EPSG:' + layer.srid)]

      !loaded && loadFeatures()
      loaded = true
  
      return extent
    }
  });
  
  layer.L = new ol.layer.Vector({
    source: source,
    zIndex: layer.style.zIndex || 1,
    style: _xyz.mapview.layer.styleFunction(layer)
  })

  layer.L.set('layer', layer, true)
}