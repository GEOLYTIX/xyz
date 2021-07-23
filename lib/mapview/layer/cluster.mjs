import select from './selectCluster.mjs';

import infotip from './infotip.mjs';

export default _xyz => layer => {

  layer.highlight = true;

  layer.select = select(_xyz);

  layer.infotip = infotip(_xyz);

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
          dbscan: layer.cluster_dbscan,
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
    
      const features = cluster.map(f => new ol.Feature({
        id: id++,
        geometry: new ol.geom.Point(
          layer.srid == 4326 && ol.proj.fromLonLat([f.geometry.x, f.geometry.y]) || [f.geometry.x, f.geometry.y]
        ),
        properties: f.properties
      }));

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
    zIndex: layer.style.zIndex || 10,
    style: feature => {

      const properties = feature.getProperties().properties;
  
      const marker = properties.size > 1 ?
        Object.assign({}, layer.style.default, layer.style.cluster) :
        Object.assign({}, layer.style.default);

      marker.scale = marker.scale || 1

      const theme = Object.assign({}, layer.style.theme);
  
      // Categorized theme
      if (theme && theme.type === 'categorized') {

        Object.assign(
          marker,
          theme.cat[properties.cat] && theme.cat[properties.cat].style || theme.cat[properties.cat]);
      }
  
      // Graduated theme.
      if (theme && theme.type === 'graduated') {
  
        const value = parseFloat(properties.cat);

        if (value || value === 0) {

          // Iterate through cat array.
          for (let i = 0; i < theme.cat_arr.length; i++) {
    
            // Break iteration is cat value is below current cat array value.
            if (value < theme.cat_arr[i].value) break;
      
            // Set cat_style to current cat style after value check.
            var cat_style = theme.cat_arr[i].style || theme.cat_arr[i];
          }
  
          // Assign style from base & cat_style.
          Object.assign(marker, cat_style);
        }
      }

      marker.size = marker.size || 1

      if (marker.sizing === 'logscale' && properties.count > 1) {

        marker.size +=  marker.size / Math.log(layer.max_size) * Math.log(properties.size)
      }

      if (marker.sizing === 'fixed') {

        marker.size = marker.size
      }

      if (!marker.sizing && properties.count > 1) {

        marker.size += marker.size / layer.max_size * properties.size
      }

      if (marker.sizing === 'relative') {

        marker.scale *= _xyz.mapview.getZoom() / (_xyz.locale.maxZoom - _xyz.locale.minZoom)
      }

      marker.scale *= marker.size

      if (layer.highlight === feature.get('id')){

        let tmpHighlightStyle = _xyz.utils.cloneDeep(layer.style.highlight);

        delete tmpHighlightStyle.scale

        marker.scale *= layer.style.highlight.scale || 1

        Object.assign(marker, tmpHighlightStyle)
      }

      if(marker.layers && Array.isArray(marker.layers)) {

        return marker.layers.map(l => {
          return new ol.style.Style({
            zIndex: layer.style.zIndex,
            image: _xyz.mapview.icon(l)
          })
        })
      
      }

      return new ol.style.Style({
        zIndex: layer.style.zIndex,
        image: _xyz.mapview.icon(marker)
      })

    }
  })

  layer.label = _xyz.mapview.layer.clusterLabel(layer)

}