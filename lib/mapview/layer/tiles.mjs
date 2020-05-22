export default _xyz => layer => {

  const url = layer.URI.indexOf('provider') > 0 ?
    _xyz.host + '/api/proxy?' + _xyz.utils.paramString({
      uri: layer.URI
    }) :
    layer.URI;

  const source = new _xyz.mapview.lib.source.OSM({
    url: decodeURIComponent(url),
    opaque: false,
    transition: 0,
  });

  layer.L = new _xyz.mapview.lib.layer.Tile({
    source: source,
    layer: layer,
    zIndex: -1
  });

};