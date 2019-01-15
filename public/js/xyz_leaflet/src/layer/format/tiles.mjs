export default (_xyz, layer) => () => {

  if (!layer.display) return;

  // Return from layer get once added to map.
  if (layer.loaded) return;
  layer.loaded = true;

  if (layer.attribution) _xyz.attribution.set(layer.attribution);

  // Augment request with token if proxied through backend.
  // Otherwise requests will be sent directly to the URI and may not pass through the XYZ backend.  
  let uri = layer.URI.indexOf('provider') > 0 ?
    _xyz.host + '/proxy/request?uri=' + layer.URI + '&token=' + _xyz.token :
    layer.URI;

    // Assign the tile layer to the layer L object and add to map.
  layer.L = L.tileLayer(uri, {
    updateWhenIdle: true,
    pane: layer.key
  })
    .on('load', () => {
      
      if (layer.loader)  layer.loader.style.display = 'none';

    })
    .addTo(_xyz.map);

};