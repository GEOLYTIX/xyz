import select from './selectCluster.mjs';

import infotip from './infotip.mjs';

export default (_xyz) => (layer) => {
  layer.highlight = true;

  layer.select = select(_xyz);

  layer.infotip = infotip(_xyz);

  layer.style.highlight.icon = layer.style.highlight.icon || layer.style.highlight.marker || Object.assign({}, layer.style.highlight)

  layer.reload = () => {

    source.set('bbox', null)
    source.clear(true)
    //source.refresh()
  }

  function loader (extent) {

    source.clear(true)

    if (layer.xhr) layer.xhr.abort()

    source.clear()

    const tableZ = layer.tableCurrent()

    if (!tableZ) return

    layer.xhr = new XMLHttpRequest()

    layer.xhr.open(
      'GET', _xyz.host + `/api/layer/cluster/${_xyz.mapview.getZoom()}?` +
        _xyz.utils.paramString({
          locale: _xyz.locale.key,
          layer: layer.key,
          table: tableZ,
          kmeans: layer.cluster_kmeans,
          pixelRatio: window.devicePixelRatio,
          aggregate: layer.style.theme && layer.style.theme.aggregate,
          theme: layer.style.theme && layer.style.themes && encodeURIComponent(Object.keys(layer.style.themes).find(k => layer.style.themes[k] === layer.style.theme)),
          label: layer.style.label && layer.style.label.field,
          count: layer.style.label && layer.style.label.count,
          filter: layer.filter && layer.filter.current,
          viewport: [extent[0], extent[1], extent[2], extent[3]]
        }));

    layer.xhr.setRequestHeader('Content-Type', 'application/json');
    layer.xhr.responseType = 'json';

    // Draw layer on load event.
    layer.xhr.onload = e => {
  
      if (e.target.status !== 200) return;

      const cluster = e.target.response;

      layer.max_size = cluster.reduce((max_size, f) => Math.max(max_size, f.properties.size), 0);
    
      let id = 1;
    
      const features = cluster.map(f => new ol.Feature(Object.assign({
        id: id++,
        geometry: new ol.geom.Point(
          layer.srid == 4326 && ol.proj.fromLonLat([f.geometry.x, f.geometry.y]) || [f.geometry.x, f.geometry.y]
        ),
        //properties: f.properties
      },f.properties)));

      source.addFeatures(features);
    
    };

    layer.xhr.send();

  }

  const source = new ol.source.Vector({
    loader: () => {},
    strategy: function(extent) {

      extent = [ol.proj.transformExtent(extent, 'EPSG:' + _xyz.mapview.srid, 'EPSG:' + layer.srid)]

      const bbox = extent.join(',');
      if (bbox != this.get('bbox')) {
        this.set('bbox', bbox)
        loader(extent)
      }
  
      return extent
    }
  })

  layer.L = new ol.layer.Vector({
    layer: layer,
    source: source,
    //declutter: layer.style.label?.declutter,
    zIndex: layer.style.zIndex || 10,
    style: _xyz.mapview.layer.styleFunction(layer)
  })

}
