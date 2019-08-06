export default _xyz => layer => {

  // Augment request with token if proxied through backend.
  // Otherwise requests will be sent directly to the URI and may not pass through the XYZ backend.  
  const url = layer.URI.indexOf('provider') > 0 ?
    _xyz.host + '/proxy/request?' + _xyz.utils.paramString({
      uri: layer.URI,
      token: _xyz.token
    }) :
    layer.URI;

  const source = new _xyz.mapview.lib.source.OSM({
    url: decodeURIComponent(url),
    opaque: false,
    transition: 0,
  });

  // Number of tiles currently loading.
  let tilesLoading = 0;

  // Increase the number of tiles loading at load start event.
  // Display loading indicator if it exists.
  source.on('tileloadstart', () => {
    tilesLoading++;
    if (layer.view.loader) layer.view.loader.style.display = 'block';
  });
  
  // Decrease the number of tiles loading at load end event.
  // Hide loading indicator if it exists.
  source.on('tileloadend', () => {
    tilesLoading--;
    if (layer.view.loader && tilesLoading === 0) layer.view.loader.style.display = 'none';
  });

  layer.L = new _xyz.mapview.lib.layer.Tile({
    source: source,
    layer: layer
  });

};