export default _xyz => layer => () => {

  if (!layer.display) return ;//layer.remove();

  // Return from layer get once added to map.
  if (layer.loaded) return;
  layer.loaded = true;

  // Augment request with token if proxied through backend.
  // Otherwise requests will be sent directly to the URI and may not pass through the XYZ backend.  
  const uri = layer.URI.indexOf('provider') > 0 ?
    _xyz.host + '/proxy/request?' + _xyz.utils.paramString({
      uri: layer.URI,
      token: _xyz.token
    }) :
    layer.URI;

  
  if (layer.L) return;

  // Assign the tile layer to the layer L object and add to map.
  layer.L = L.tileLayer(decodeURIComponent(uri), {
    updateWhenIdle: true,
    pane: layer.key
  })
    .on('load', () => {
      
      if (layer.view.loader)  layer.view.loader.style.display = 'none';

    })
    .addTo(_xyz.map);

};