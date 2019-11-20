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

  layer.L = new _xyz.mapview.lib.layer.Tile({
    source: source,
    layer: layer
  });

};