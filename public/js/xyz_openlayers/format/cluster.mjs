export default _xyz => layer => () => {

  // Get table for the current zoom level.
  const table = layer.tableCurrent();

  // Return if layer should not be displayed.
  if (!layer.display) return;

  if (!table && layer.L) return _xyz.map.removeLayer(layer.L);

  // Set layer table to be table from tables array.
  layer.table = table;

  // Create filter from legend and current filter.
  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

  // Get bounds for request.
  const bounds = _xyz.mapview.lib.getBounds();

  if (layer.xhr) {
    layer.xhr.abort();
    layer.xhr.onload = null;
    if (layer.L) _xyz.map.removeLayer(layer.L);
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

    // Data is returned and the layer is still current.
    if (e.target.status !== 200 || !layer.display) return;

    const cluster = e.target.response;

    const max_size = cluster.reduce((max_size, f) => Math.max(max_size, f.properties.size), 0);

    // Create cat array for graduated theme.
    if (layer.style.theme && layer.style.theme.type === 'graduated') {
      layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    }

    const features = cluster.map(f => new _xyz.mapview.lib.ol.Feature({
      geometry: new _xyz.mapview.lib.ol.geom.Point([f.geometry.x, f.geometry.y]),
      properties: f.properties
    }));

    const sourceVector = new _xyz.mapview.lib.ol.source.Vector({features: features});

    layer.L = new _xyz.mapview.lib.ol.layer.Vector({
      source: sourceVector,
      style: feature => {

        const properties = feature.getProperties().properties;
 
        const marker = style(properties);
        
        const iconSize = layer.cluster_logscale ?
          properties.count === 1 ?
            layer.style.markerMin :
            layer.style.markerMin + layer.style.markerMax / Math.log(max_size) * Math.log(properties.size) :
          properties.count === 1 ?
            layer.style.markerMin :
            layer.style.markerMin + layer.style.markerMax / max_size * properties.size;

  
        return new _xyz.mapview.lib.ol.style.Style({
          // zIndex: style.zIndex,
          image: _xyz.mapview.lib.icon({
            url: _xyz.utils.svg_symbols(marker),
            iconSize: iconSize
          })
        });

      }
    });


    function style(properties) {

      let marker = layer.style.marker;

      if (properties.size > 1) marker = layer.style.markerMulti;

      // Return marker if no theme is set.
      if (!layer.style.theme) return marker;

      // Categorized theme
      if (layer.style.theme.type === 'categorized') {

        return Object.assign(
          {},
          marker,
          layer.style.theme.cat[properties.cat] || {});
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

      // // Competition theme.
      // if (layer.style.theme.type === 'competition') {

      //   // Set counter for point to 0.
      //   let size = point.properties.size;

      //   // Create a new cat_style with an empty layers object to store the competition layers.
      //   param.cat_style = {
      //     layers: {}
      //   };

      //   // Iterate through cats in competition theme.
      //   //Object.keys(point.properties.cat).forEach(comp => {
      //   Object.entries(point.properties.cat).sort((a, b) => a[1] - b[1]).forEach(comp => {

      //     // Check for the competition cat in point properties.
      //     if (layer.style.theme.cat[comp[0]]) {

      //       // Add a cat layer to the marker obkject.
      //       // Calculate the size of the competition layer.
      //       // Competition layer added first must be largest.
      //       param.cat_style.layers[size / point.properties.size] = layer.style.theme.cat[comp[0]].fillColor;

      //     }

      //     // Reduce the current size by the size of layer just added to marker.
      //     size -= comp[1];

      //   });

      //   // Assign marker from base & cat_style.
      //   param.marker = Object.assign({}, param.marker, param.cat_style);

      //   return marker(latlng, layer, point, param);
      // }

    }


    _xyz.map.addLayer(layer.L);




    //   onEachFeature: (_feature, _layer) => {

    //     // load permanent labels

    //     if (!layer.hover || !layer.hover.field || !layer.hover.permanent) return;

    //     if(_feature.properties.count > 1) return;

    //     const count = _feature.properties.count;

    //     const lnglat = _feature.geometry.coordinates;

    //     const xhr = new XMLHttpRequest();

    //     const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

    //     xhr.open('GET', _xyz.host + '/api/location/select/cluster?' + _xyz.utils.paramString({
    //       locale: _xyz.workspace.locale.key,
    //       layer: layer.key,
    //       table: layer.table,
    //       filter: JSON.stringify(filter),
    //       count: count > 99 ? 99 : count,
    //       lnglat: lnglat,
    //       token: _xyz.token
    //     }));

    //     xhr.setRequestHeader('Content-Type', 'application/json');
    //     xhr.responseType = 'json';

    //     xhr.onload = e => {

    //       if (e.target.status !== 200) return;

    //       const cluster = e.target.response;

    //       if (cluster.length !== 1) return;

    //       _layer.hover = {};

    //       _layer.hover.tooltip = _xyz.utils.wire()`<div class="hover-box">`;
    //       _layer.hover.tooltip.dataset.layer = layer.key;
    //       _layer.hover.tooltip.innerHTML = cluster[0].label;
    //       _xyz.mapview.node.appendChild(_layer.hover.tooltip);
          
    //       let coords = _xyz.map.latLngToContainerPoint({lat: _feature.geometry.coordinates[1], lng: _feature.geometry.coordinates[0]});

    //       _layer.hover.tooltip.style.left = `${parseInt(coords.x) - (_layer.hover.tooltip.offsetWidth / 2) + _xyz.layers.listview.node.clientWidth}px`;
    //       _layer.hover.tooltip.style.top = `${parseInt(coords.y) - 15 - _layer.hover.tooltip.offsetHeight}px`;
    //       _layer.hover.tooltip.style.opacity = 1;

    //     };

    //     xhr.send();
    //   }
    // })
    //   .on('click', e => {

    //     if (document.body.dataset.viewmode === 'report') return;

    //     if(_xyz.mapview.state !== 'select') return; 

    //     let
    //       count = e.layer.feature.properties.count,
    //       lnglat = e.layer.feature.geometry.coordinates;

    //     const xhr = new XMLHttpRequest();

    //     const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

    //     xhr.open('GET', _xyz.host + '/api/location/select/cluster?' + _xyz.utils.paramString({
    //       locale: _xyz.workspace.locale.key,
    //       layer: layer.key,
    //       table: layer.table,
    //       filter: JSON.stringify(filter),
    //       count: count > 99 ? 99 : count,
    //       lnglat: lnglat,
    //       token: _xyz.token
    //     }));

    //     xhr.setRequestHeader('Content-Type', 'application/json');
    //     xhr.responseType = 'json';

    //     xhr.onload = e => {

    //       if (e.target.status !== 200) return;

    //       let cluster = e.target.response;

    //       if (cluster.length > 1) return select(cluster, lnglat);

    //       if (cluster.length === 1) return _xyz.locations.select({
    //         locale: _xyz.workspace.locale.key,
    //         layer: layer.key,
    //         table: layer.table,
    //         id: cluster[0].id,
    //         marker: cluster[0].lnglat,
    //         edit: layer.edit
    //       });

    //     };

    //     xhr.send();
    //   })
    //   .on('mouseover', e => {

    //     if (!layer.hover.field || layer.hover.permanent) return;

    //     const count = e.layer.feature.properties.count;

    //     const lnglat = e.layer.feature.geometry.coordinates;

    //     const clientX = e.originalEvent.clientX;

    //     const clientY = e.originalEvent.clientY;

    //     const xhr = new XMLHttpRequest();

    //     const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

    //     xhr.open('GET', _xyz.host + '/api/location/select/cluster?' + _xyz.utils.paramString({
    //       locale: _xyz.workspace.locale.key,
    //       layer: layer.key,
    //       table: layer.table,
    //       filter: JSON.stringify(filter),
    //       count: count > 99 ? 99 : count,
    //       lnglat: lnglat,
    //       token: _xyz.token
    //     }));

    //     xhr.setRequestHeader('Content-Type', 'application/json');
    //     xhr.responseType = 'json';

    //     xhr.onload = e => {

    //       if (e.target.status !== 200) return;

    //       const cluster = e.target.response;

    //       if (cluster.length !== 1) return;

    //       layer.hover.add({
    //         id: cluster[0].id,
    //         x: clientX,
    //         y: clientY,
    //       });

    //     };

    //     xhr.send();

    //   })
    //   .on('mouseout', e => {
    //     if (layer.hover.field && !layer.hover.permanent) layer.hover.remove();
    //   })
    //   .on('contextmenu', e => {

    //     _xyz.geom.point_edit(e, layer);
      
    //   })
    //   .addTo(_xyz.map);

    //if(layer.style.legend) layer.hover.toggle({container: layer.style.legend.parentNode});

  };

  layer.xhr.send();


  // // remove static labels if any created
  // _xyz.map.on('movestart', e => {
  //   document.querySelectorAll('#Map .hover-box').forEach(el => { el.remove(); });
  // });

  // _xyz.map.on('zoomstart', e => {
  //   document.querySelectorAll('#Map .hover-box').forEach(el => { el.remove(); });
  // });

  // function select(list, lnglat) {

  //   const ul = document.createElement('ul');

  //   for (let i = 0; i < list.length; i++) {

  //     _xyz.utils.createElement({
  //       tag: 'li',
  //       options: {
  //         textContent: list[i].label,
  //         'data-id': list[i].id,
  //         'data-marker': list[i].lnglat
  //       },
  //       appendTo: ul,
  //       eventListener: {
  //         event: 'click',
  //         funct: e => {

  //           _xyz.locations.select({
  //             locale: _xyz.workspace.locale.key,
  //             layer: layer.key,
  //             table: layer.table,
  //             id: e.target['data-id'],
  //             marker: e.target['data-marker'],
  //             edit: layer.edit
  //           });

  //         }
  //       }
  //     });

  //   }

  //   _xyz.mapview.popup({
  //     latlng: [lnglat[1], lnglat[0]],
  //     content: ul
  //   });

  // };

};