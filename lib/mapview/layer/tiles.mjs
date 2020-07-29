export default _xyz => layer => {

  const url = layer.URI.indexOf('provider') > 0 ?
    _xyz.host + '/api/proxy?' + _xyz.utils.paramString({
      uri: layer.URI
    }) :
    layer.URI;

  const source = new ol.source.OSM({
    url: decodeURIComponent(url),
    opaque: false,
    transition: 0,
  });

  layer.L = new ol.layer.Tile({
    source: source,
    layer: layer,
    zIndex: typeof layer.style.zIndex === 'undefined' ? -1 : layer.style.zIndex
  });

};